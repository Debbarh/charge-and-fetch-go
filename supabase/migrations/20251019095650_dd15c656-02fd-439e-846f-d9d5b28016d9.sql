-- Table des évaluations des chauffeurs
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.driver_offers(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  vehicle_condition_rating INTEGER CHECK (vehicle_condition_rating >= 1 AND vehicle_condition_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  -- Un client ne peut évaluer qu'une seule fois par demande
  UNIQUE(client_id, request_id)
);

-- Table des statistiques agrégées des chauffeurs
CREATE TABLE public.driver_stats (
  driver_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_rides INTEGER NOT NULL DEFAULT 0,
  completed_rides INTEGER NOT NULL DEFAULT 0,
  cancelled_rides INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER NOT NULL DEFAULT 0,
  -- Moyennes par catégorie
  avg_punctuality DECIMAL(3,2) DEFAULT 0,
  avg_communication DECIMAL(3,2) DEFAULT 0,
  avg_vehicle_condition DECIMAL(3,2) DEFAULT 0,
  avg_professionalism DECIMAL(3,2) DEFAULT 0,
  -- Métriques de temps
  average_response_time_minutes INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour ratings
-- Les clients peuvent créer des évaluations pour leurs demandes
CREATE POLICY "Les clients peuvent créer des évaluations"
  ON public.ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = request_id
      AND requests.user_id = auth.uid()
      AND requests.status = 'driver_selected'
    )
  );

-- Les clients peuvent voir leurs propres évaluations
CREATE POLICY "Les clients peuvent voir leurs évaluations"
  ON public.ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- Les chauffeurs peuvent voir les évaluations qui les concernent
CREATE POLICY "Les chauffeurs peuvent voir leurs évaluations"
  ON public.ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = driver_id);

-- Les clients peuvent modifier leurs évaluations (dans un délai raisonnable)
CREATE POLICY "Les clients peuvent modifier leurs évaluations"
  ON public.ratings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id AND
    created_at > NOW() - INTERVAL '7 days'
  );

-- RLS Policies pour driver_stats
-- Tout le monde peut voir les stats publiques des chauffeurs
CREATE POLICY "Les stats des chauffeurs sont publiques"
  ON public.driver_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Seuls les chauffeurs peuvent mettre à jour leurs propres stats (via triggers)
CREATE POLICY "Les chauffeurs peuvent voir leurs stats"
  ON public.driver_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = driver_id);

-- Triggers pour updated_at
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_driver_stats_updated_at
  BEFORE UPDATE ON public.driver_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Fonction pour mettre à jour automatiquement les stats du chauffeur après une évaluation
CREATE OR REPLACE FUNCTION public.update_driver_stats_after_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer ou mettre à jour les stats du chauffeur
  INSERT INTO driver_stats (
    driver_id,
    total_ratings,
    average_rating,
    avg_punctuality,
    avg_communication,
    avg_vehicle_condition,
    avg_professionalism
  )
  SELECT
    NEW.driver_id,
    COUNT(*)::INTEGER,
    ROUND(AVG(overall_rating)::NUMERIC, 2),
    ROUND(AVG(NULLIF(punctuality_rating, 0))::NUMERIC, 2),
    ROUND(AVG(NULLIF(communication_rating, 0))::NUMERIC, 2),
    ROUND(AVG(NULLIF(vehicle_condition_rating, 0))::NUMERIC, 2),
    ROUND(AVG(NULLIF(professionalism_rating, 0))::NUMERIC, 2)
  FROM ratings
  WHERE driver_id = NEW.driver_id
  ON CONFLICT (driver_id) DO UPDATE SET
    total_ratings = EXCLUDED.total_ratings,
    average_rating = EXCLUDED.average_rating,
    avg_punctuality = EXCLUDED.avg_punctuality,
    avg_communication = EXCLUDED.avg_communication,
    avg_vehicle_condition = EXCLUDED.avg_vehicle_condition,
    avg_professionalism = EXCLUDED.avg_professionalism,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Trigger pour mettre à jour les stats après insertion d'une évaluation
CREATE TRIGGER update_driver_stats_on_rating
  AFTER INSERT OR UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_driver_stats_after_rating();

-- Fonction pour incrémenter le compteur de courses terminées
CREATE OR REPLACE FUNCTION public.increment_driver_completed_rides()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO driver_stats (driver_id, completed_rides, total_rides)
    VALUES (
      (SELECT driver_id FROM driver_offers WHERE id = NEW.selected_driver_id),
      1,
      1
    )
    ON CONFLICT (driver_id) DO UPDATE SET
      completed_rides = driver_stats.completed_rides + 1,
      total_rides = driver_stats.total_rides + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour compter les courses terminées
CREATE TRIGGER count_completed_rides
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.increment_driver_completed_rides();

-- Indexes pour performance
CREATE INDEX idx_ratings_driver_id ON public.ratings(driver_id);
CREATE INDEX idx_ratings_client_id ON public.ratings(client_id);
CREATE INDEX idx_ratings_request_id ON public.ratings(request_id);
CREATE INDEX idx_ratings_created_at ON public.ratings(created_at DESC);
CREATE INDEX idx_driver_stats_average_rating ON public.driver_stats(average_rating DESC);

-- Vue pour obtenir les meilleures chauffeurs
CREATE OR REPLACE VIEW public.top_drivers AS
SELECT 
  ds.driver_id,
  p.full_name as driver_name,
  ds.average_rating,
  ds.total_ratings,
  ds.completed_rides,
  ds.avg_punctuality,
  ds.avg_communication,
  ds.avg_vehicle_condition,
  ds.avg_professionalism
FROM driver_stats ds
JOIN profiles p ON ds.driver_id = p.id
WHERE ds.total_ratings >= 3  -- Au moins 3 évaluations
ORDER BY ds.average_rating DESC, ds.total_ratings DESC
LIMIT 10;