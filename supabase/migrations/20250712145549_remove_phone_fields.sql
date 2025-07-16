-- Remove phone fields from influencer_profiles and business_profiles tables

-- Remove phone column from influencer_profiles table
ALTER TABLE public.influencer_profiles DROP COLUMN IF EXISTS phone;

-- Remove phone column from business_profiles table
ALTER TABLE public.business_profiles DROP COLUMN IF EXISTS phone;