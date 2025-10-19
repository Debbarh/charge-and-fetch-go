-- Créer une table pour les demandes de vérification de chauffeur
CREATE TABLE IF NOT EXISTS public.driver_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Documents requis
  driver_license_url TEXT,
  vehicle_registration_url TEXT,
  insurance_url TEXT,
  identity_document_url TEXT,
  
  -- Informations du véhicule
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_color TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  
  -- Informations professionnelles
  experience_years INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  hourly_rate NUMERIC(10, 2),
  
  -- Statut de vérification
  verified_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Activer RLS
ALTER TABLE public.driver_verifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les utilisateurs peuvent créer leur demande de vérification"
  ON public.driver_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent voir leur demande"
  ON public.driver_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur demande en attente"
  ON public.driver_verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Index pour performance
CREATE INDEX idx_driver_verifications_user_id ON public.driver_verifications(user_id);
CREATE INDEX idx_driver_verifications_status ON public.driver_verifications(status);

-- Trigger pour updated_at
CREATE TRIGGER update_driver_verifications_updated_at
  BEFORE UPDATE ON public.driver_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Fonction pour approuver une demande et assigner le rôle chauffeur
CREATE OR REPLACE FUNCTION public.approve_driver_verification(verification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_verification RECORD;
BEGIN
  -- Récupérer la vérification
  SELECT * INTO v_verification
  FROM driver_verifications
  WHERE id = verification_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification not found or already processed';
  END IF;
  
  v_user_id := v_verification.user_id;
  
  -- Mettre à jour le statut de vérification
  UPDATE driver_verifications
  SET 
    status = 'approved',
    verified_at = NOW(),
    reviewed_by = auth.uid()
  WHERE id = verification_id;
  
  -- Ajouter le rôle chauffeur
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'chauffeur')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Mettre à jour le profil avec les informations du véhicule
  UPDATE profiles
  SET 
    vehicle_make = v_verification.vehicle_make,
    vehicle_model = v_verification.vehicle_model,
    vehicle_year = v_verification.vehicle_year,
    vehicle_color = v_verification.vehicle_color,
    vehicle_plate = v_verification.vehicle_plate,
    experience_years = v_verification.experience_years,
    bio = COALESCE(v_verification.bio, bio),
    hourly_rate = COALESCE(v_verification.hourly_rate, hourly_rate),
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Créer une notification pour l'utilisateur
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    v_user_id,
    'driver_approved',
    'Félicitations ! 🎉',
    'Votre demande pour devenir chauffeur a été approuvée. Vous pouvez maintenant commencer à accepter des demandes.',
    jsonb_build_object('verification_id', verification_id)
  );
END;
$$;