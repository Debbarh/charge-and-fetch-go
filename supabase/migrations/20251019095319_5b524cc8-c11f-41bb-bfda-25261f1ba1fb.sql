-- Create enum for negotiation roles
CREATE TYPE negotiation_role AS ENUM ('client', 'driver');

-- Create enum for negotiation status
CREATE TYPE negotiation_status AS ENUM ('pending', 'accepted', 'rejected', 'counter_offered');

-- Table des négociations (historique des échanges)
CREATE TABLE public.negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.driver_offers(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_role negotiation_role NOT NULL,
  proposed_price DECIMAL(10,2) NOT NULL,
  proposed_duration TEXT,
  message TEXT NOT NULL,
  status negotiation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour negotiations
-- Les utilisateurs peuvent voir les négociations liées à leurs offres
CREATE POLICY "Les utilisateurs peuvent voir les négociations de leurs offres"
  ON public.negotiations
  FOR SELECT
  TO authenticated
  USING (
    -- Soit je suis le chauffeur de l'offre
    EXISTS (
      SELECT 1 FROM public.driver_offers
      WHERE driver_offers.id = negotiations.offer_id
      AND driver_offers.driver_id = auth.uid()
    )
    OR
    -- Soit je suis le client de la demande liée à l'offre
    EXISTS (
      SELECT 1 FROM public.driver_offers
      JOIN public.requests ON driver_offers.request_id = requests.id
      WHERE driver_offers.id = negotiations.offer_id
      AND requests.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des négociations
CREATE POLICY "Les utilisateurs peuvent créer des négociations"
  ON public.negotiations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id AND
    (
      -- Soit je suis le chauffeur de l'offre
      EXISTS (
        SELECT 1 FROM public.driver_offers
        WHERE driver_offers.id = offer_id
        AND driver_offers.driver_id = auth.uid()
        AND from_role = 'driver'
      )
      OR
      -- Soit je suis le client de la demande
      EXISTS (
        SELECT 1 FROM public.driver_offers
        JOIN public.requests ON driver_offers.request_id = requests.id
        WHERE driver_offers.id = offer_id
        AND requests.user_id = auth.uid()
        AND from_role = 'client'
      )
    )
  );

-- Les utilisateurs peuvent modifier le statut de leurs négociations
CREATE POLICY "Les utilisateurs peuvent modifier les négociations"
  ON public.negotiations
  FOR UPDATE
  TO authenticated
  USING (
    -- Soit je suis le chauffeur de l'offre
    EXISTS (
      SELECT 1 FROM public.driver_offers
      WHERE driver_offers.id = offer_id
      AND driver_offers.driver_id = auth.uid()
    )
    OR
    -- Soit je suis le client de la demande
    EXISTS (
      SELECT 1 FROM public.driver_offers
      JOIN public.requests ON driver_offers.request_id = requests.id
      WHERE driver_offers.id = offer_id
      AND requests.user_id = auth.uid()
    )
  );

-- Trigger pour updated_at
CREATE TRIGGER update_negotiations_updated_at
  BEFORE UPDATE ON public.negotiations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes pour performance
CREATE INDEX idx_negotiations_offer_id ON public.negotiations(offer_id);
CREATE INDEX idx_negotiations_from_user_id ON public.negotiations(from_user_id);
CREATE INDEX idx_negotiations_status ON public.negotiations(status);
CREATE INDEX idx_negotiations_created_at ON public.negotiations(created_at DESC);

-- Fonction pour obtenir l'historique complet d'une offre
CREATE OR REPLACE FUNCTION public.get_negotiation_history(p_offer_id UUID)
RETURNS TABLE (
  id UUID,
  from_user_id UUID,
  from_role negotiation_role,
  from_user_name TEXT,
  proposed_price DECIMAL,
  proposed_duration TEXT,
  message TEXT,
  status negotiation_status,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    n.id,
    n.from_user_id,
    n.from_role,
    COALESCE(p.full_name, 'Utilisateur') as from_user_name,
    n.proposed_price,
    n.proposed_duration,
    n.message,
    n.status,
    n.created_at
  FROM negotiations n
  LEFT JOIN profiles p ON n.from_user_id = p.id
  WHERE n.offer_id = p_offer_id
  ORDER BY n.created_at ASC
$$;