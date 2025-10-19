-- Add vehicle and availability columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS vehicle_make TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_year INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_color TEXT,
ADD COLUMN IF NOT EXISTS vehicle_plate TEXT,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": true, "sunday": true}'::jsonb,
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2);

-- Add index for faster queries on vehicle type
CREATE INDEX IF NOT EXISTS idx_profiles_vehicle_type ON public.profiles(vehicle_type);

-- Add index for specialties search
CREATE INDEX IF NOT EXISTS idx_profiles_specialties ON public.profiles USING GIN(specialties);