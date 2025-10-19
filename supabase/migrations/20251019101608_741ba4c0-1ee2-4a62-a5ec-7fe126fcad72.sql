-- Create ride_tracking table for GPS tracking
CREATE TABLE IF NOT EXISTS public.ride_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled')),
  driver_latitude DOUBLE PRECISION,
  driver_longitude DOUBLE PRECISION,
  pickup_eta_minutes INTEGER,
  destination_eta_minutes INTEGER,
  distance_to_pickup_km DOUBLE PRECISION,
  distance_to_destination_km DOUBLE PRECISION,
  started_at TIMESTAMP WITH TIME ZONE,
  arrived_at_pickup TIMESTAMP WITH TIME ZONE,
  arrived_at_destination TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ride_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Drivers can update their own ride tracking"
ON public.ride_tracking
FOR UPDATE
USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert their own ride tracking"
ON public.ride_tracking
FOR INSERT
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Clients can view tracking for their requests"
ON public.ride_tracking
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = ride_tracking.request_id
    AND requests.user_id = auth.uid()
  )
);

CREATE POLICY "Drivers can view their own ride tracking"
ON public.ride_tracking
FOR SELECT
USING (auth.uid() = driver_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ride_tracking_request ON public.ride_tracking(request_id);
CREATE INDEX IF NOT EXISTS idx_ride_tracking_driver ON public.ride_tracking(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_tracking_status ON public.ride_tracking(status);

-- Trigger for updated_at
CREATE TRIGGER update_ride_tracking_updated_at
BEFORE UPDATE ON public.ride_tracking
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_tracking;