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

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_driver_stats_on_rating ON public.ratings;

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
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    -- Récupérer le driver_id de l'offre sélectionnée
    DECLARE
      v_driver_id UUID;
    BEGIN
      SELECT driver_id INTO v_driver_id
      FROM driver_offers 
      WHERE id = NEW.selected_driver_id;
      
      IF v_driver_id IS NOT NULL THEN
        INSERT INTO driver_stats (driver_id, completed_rides, total_rides)
        VALUES (v_driver_id, 1, 1)
        ON CONFLICT (driver_id) DO UPDATE SET
          completed_rides = driver_stats.completed_rides + 1,
          total_rides = driver_stats.total_rides + 1,
          updated_at = NOW();
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS count_completed_rides ON public.requests;

-- Trigger pour compter les courses terminées
CREATE TRIGGER count_completed_rides
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.increment_driver_completed_rides();

-- Vue pour obtenir les meilleurs chauffeurs
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
WHERE ds.total_ratings >= 3
ORDER BY ds.average_rating DESC, ds.total_ratings DESC
LIMIT 10;