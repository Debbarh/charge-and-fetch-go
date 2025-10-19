-- Ajouter les colonnes pour les documents KYC
ALTER TABLE public.driver_verifications
ADD COLUMN IF NOT EXISTS driver_license_url TEXT,
ADD COLUMN IF NOT EXISTS identity_document_url TEXT,
ADD COLUMN IF NOT EXISTS insurance_url TEXT,
ADD COLUMN IF NOT EXISTS vehicle_registration_url TEXT;

-- Créer le bucket de stockage pour les documents des chauffeurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'driver-documents',
  'driver-documents',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- RLS pour que les chauffeurs puissent uploader leurs documents
CREATE POLICY "Les utilisateurs peuvent uploader leurs documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS pour que les chauffeurs puissent voir leurs documents
CREATE POLICY "Les utilisateurs peuvent voir leurs documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS pour que les chauffeurs puissent mettre à jour leurs documents
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS pour que les chauffeurs puissent supprimer leurs documents
CREATE POLICY "Les utilisateurs peuvent supprimer leurs documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS pour que les admins puissent voir tous les documents
CREATE POLICY "Les admins peuvent voir tous les documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  public.is_admin(auth.uid())
);

-- RLS pour que les admins puissent supprimer tous les documents
CREATE POLICY "Les admins peuvent supprimer tous les documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'driver-documents' AND
  public.is_admin(auth.uid())
);