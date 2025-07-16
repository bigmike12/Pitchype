-- Add first_name and last_name columns to profiles table
-- and populate them from existing profile tables

-- Add columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update profiles table with names from influencer_profiles
UPDATE public.profiles 
SET 
  first_name = ip.first_name,
  last_name = ip.last_name
FROM public.influencer_profiles ip
WHERE profiles.id = ip.id
  AND profiles.user_role = 'influencer'
  AND ip.first_name IS NOT NULL;

-- Update profiles table with names from business_profiles
UPDATE public.profiles 
SET 
  first_name = bp.first_name,
  last_name = bp.last_name
FROM public.business_profiles bp
WHERE profiles.id = bp.id
  AND profiles.user_role = 'business'
  AND bp.first_name IS NOT NULL;

-- Add comments to document the columns
COMMENT ON COLUMN public.profiles.first_name IS 'First name of the user';
COMMENT ON COLUMN public.profiles.last_name IS 'Last name of the user';

-- Create index for better performance on name searches
CREATE INDEX IF NOT EXISTS idx_profiles_names ON public.profiles(first_name, last_name);