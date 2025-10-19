-- Fonction de sécurité pour vérifier le rôle admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- RLS policies pour driver_verifications (admin)
CREATE POLICY "Les admins peuvent voir toutes les vérifications"
ON public.driver_verifications
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Les admins peuvent modifier les vérifications"
ON public.driver_verifications
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Vue pour les statistiques admin (SECURITY DEFINER fonction)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  pending_verifications bigint,
  total_drivers bigint,
  recent_requests bigint,
  recent_transactions bigint,
  monthly_revenue numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*) FROM driver_verifications WHERE status = 'pending')::bigint,
    (SELECT COUNT(*) FROM user_roles WHERE role = 'chauffeur')::bigint,
    (SELECT COUNT(*) FROM requests WHERE created_at > NOW() - INTERVAL '7 days')::bigint,
    (SELECT COUNT(*) FROM transactions WHERE created_at > NOW() - INTERVAL '7 days')::bigint,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '30 days')::numeric;
$$;

-- Fonction pour rejeter une vérification
CREATE OR REPLACE FUNCTION public.reject_driver_verification(
  verification_id uuid,
  rejection_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Récupérer l'user_id
  SELECT user_id INTO v_user_id
  FROM driver_verifications
  WHERE id = verification_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification not found or already processed';
  END IF;
  
  -- Mettre à jour le statut
  UPDATE driver_verifications
  SET 
    status = 'rejected',
    rejection_reason = rejection_reason,
    rejected_at = NOW(),
    reviewed_by = auth.uid()
  WHERE id = verification_id;
  
  -- Créer une notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    v_user_id,
    'driver_rejected',
    'Demande refusée',
    'Votre demande pour devenir chauffeur a été refusée. Raison : ' || rejection_reason,
    jsonb_build_object('verification_id', verification_id, 'rejection_reason', rejection_reason)
  );
END;
$$;