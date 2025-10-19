-- Recréer la vue sans SECURITY DEFINER
DROP VIEW IF EXISTS public.top_drivers;

CREATE OR REPLACE VIEW public.top_drivers 
WITH (security_invoker=true)
AS
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