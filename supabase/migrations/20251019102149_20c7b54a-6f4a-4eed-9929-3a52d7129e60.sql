-- Ajouter les préférences de notification au profil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_new_offers BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_negotiations BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_status_changes BOOLEAN DEFAULT true;