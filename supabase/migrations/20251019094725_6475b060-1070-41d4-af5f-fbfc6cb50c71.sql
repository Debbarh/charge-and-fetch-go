-- Create enums for status types
CREATE TYPE request_status AS ENUM ('active', 'driver_selected', 'completed', 'cancelled');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'counter_offered', 'negotiating', 'selected', 'completed');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');

-- Table des demandes clients
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_address TEXT NOT NULL,
  destination_address TEXT,
  vehicle_model TEXT NOT NULL,
  urgency urgency_level NOT NULL,
  estimated_duration TEXT,
  proposed_price DECIMAL(10,2) NOT NULL,
  battery_level INTEGER NOT NULL CHECK (battery_level >= 0 AND battery_level <= 100),
  notes TEXT,
  contact_phone TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'active',
  selected_driver_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des offres chauffeurs
CREATE TABLE public.driver_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  driver_rating DECIMAL(3,2) DEFAULT 0,
  driver_total_rides INTEGER DEFAULT 0,
  driver_vehicle TEXT NOT NULL,
  driver_experience TEXT,
  proposed_price DECIMAL(10,2) NOT NULL,
  estimated_duration TEXT NOT NULL,
  message TEXT,
  driver_phone TEXT NOT NULL,
  status offer_status NOT NULL DEFAULT 'pending',
  response_time TEXT,
  availability TEXT,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour requests
-- Les clients peuvent voir et modifier leurs propres demandes
CREATE POLICY "Les clients peuvent créer leurs demandes"
  ON public.requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les clients peuvent voir leurs demandes"
  ON public.requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les clients peuvent modifier leurs demandes"
  ON public.requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Les chauffeurs peuvent voir toutes les demandes actives
CREATE POLICY "Les chauffeurs peuvent voir les demandes actives"
  ON public.requests
  FOR SELECT
  TO authenticated
  USING (
    status = 'active' AND 
    public.has_role(auth.uid(), 'chauffeur')
  );

-- RLS Policies pour driver_offers
-- Les chauffeurs peuvent créer et voir leurs offres
CREATE POLICY "Les chauffeurs peuvent créer des offres"
  ON public.driver_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = driver_id AND 
    public.has_role(auth.uid(), 'chauffeur')
  );

CREATE POLICY "Les chauffeurs peuvent voir leurs offres"
  ON public.driver_offers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Les chauffeurs peuvent modifier leurs offres"
  ON public.driver_offers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id);

-- Les clients peuvent voir les offres sur leurs demandes
CREATE POLICY "Les clients peuvent voir les offres sur leurs demandes"
  ON public.driver_offers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = driver_offers.request_id
      AND requests.user_id = auth.uid()
    )
  );

-- Trigger pour updated_at sur requests
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger pour updated_at sur driver_offers
CREATE TRIGGER update_driver_offers_updated_at
  BEFORE UPDATE ON public.driver_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes pour performance
CREATE INDEX idx_requests_user_id ON public.requests(user_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_driver_offers_request_id ON public.driver_offers(request_id);
CREATE INDEX idx_driver_offers_driver_id ON public.driver_offers(driver_id);
CREATE INDEX idx_driver_offers_status ON public.driver_offers(status);