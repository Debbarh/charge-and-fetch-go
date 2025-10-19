-- Fonction pour créer un utilisateur admin (à utiliser via SQL)
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer l'user_id depuis l'email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Ajouter le rôle admin
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin role added to user %', user_email;
END;
$$;

-- Fonction pour compter les vérifications en attente (pour les badges)
CREATE OR REPLACE FUNCTION public.count_pending_verifications()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM driver_verifications
  WHERE status = 'pending';
$$;