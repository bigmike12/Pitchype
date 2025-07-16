-- Add missing first_name and last_name columns to profile tables

-- Add columns to influencer_profiles if they don't exist
ALTER TABLE public.influencer_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add columns to business_profiles if they don't exist
ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add comment to document the change
COMMENT ON COLUMN public.influencer_profiles.first_name IS 'First name of the influencer';
COMMENT ON COLUMN public.influencer_profiles.last_name IS 'Last name of the influencer';
COMMENT ON COLUMN public.business_profiles.first_name IS 'First name of the business contact';
COMMENT ON COLUMN public.business_profiles.last_name IS 'Last name of the business contact';