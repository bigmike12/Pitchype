-- Fix database relationship issues and update foreign key constraints

-- Fix campaigns table to reference profiles instead of business_profiles
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_business_id_fkey;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_business_id_fkey 
  FOREIGN KEY (business_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add missing foreign key relationship between payout_requests and influencer_bank_details
-- First, add bank_details_id column to payout_requests if it doesn't exist
ALTER TABLE public.payout_requests 
ADD COLUMN IF NOT EXISTS bank_details_id UUID REFERENCES public.influencer_bank_details(id) ON DELETE SET NULL;

-- Add index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_payout_requests_bank_details_id ON public.payout_requests(bank_details_id);

-- Update business_profiles table to remove user_id column if it exists (it should reference id from profiles)
-- The table should already be properly linked via the id column
ALTER TABLE public.business_profiles DROP COLUMN IF EXISTS user_id;

-- Ensure all foreign key constraints are properly set up after the users -> profiles rename
-- Update any remaining references to the old users table

-- Update messages table constraint
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update applications table constraints
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_influencer_id_fkey;
ALTER TABLE public.applications ADD CONSTRAINT applications_influencer_id_fkey 
  FOREIGN KEY (influencer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update social_media_verifications to reference profiles instead of influencer_profiles
ALTER TABLE public.social_media_verifications DROP CONSTRAINT IF EXISTS social_media_verifications_influencer_id_fkey;
ALTER TABLE public.social_media_verifications ADD CONSTRAINT social_media_verifications_influencer_id_fkey 
  FOREIGN KEY (influencer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update influencer_bank_details to reference profiles instead of influencer_profiles
ALTER TABLE public.influencer_bank_details DROP CONSTRAINT IF EXISTS influencer_bank_details_influencer_id_fkey;
ALTER TABLE public.influencer_bank_details ADD CONSTRAINT influencer_bank_details_influencer_id_fkey 
  FOREIGN KEY (influencer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update campaign_analytics to reference profiles instead of influencer_profiles
ALTER TABLE public.campaign_analytics DROP CONSTRAINT IF EXISTS campaign_analytics_influencer_id_fkey;
ALTER TABLE public.campaign_analytics ADD CONSTRAINT campaign_analytics_influencer_id_fkey 
  FOREIGN KEY (influencer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add missing columns to social_media_verifications for the new verification system
ALTER TABLE public.social_media_verifications 
ADD COLUMN IF NOT EXISTS verification_method VARCHAR(20) DEFAULT 'post' CHECK (verification_method IN ('post', 'bio')),
ADD COLUMN IF NOT EXISTS verification_key VARCHAR(5),
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_proof_url TEXT;

-- Create function to generate random 5-letter verification key
CREATE OR REPLACE FUNCTION generate_verification_key()
RETURNS VARCHAR(5) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  result VARCHAR(5) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate verification key when a new verification is created
CREATE OR REPLACE FUNCTION set_verification_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_key IS NULL THEN
    NEW.verification_key := generate_verification_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_verification_key
  BEFORE INSERT ON public.social_media_verifications
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_key();

-- Update RLS policies for the updated social_media_verifications table
DROP POLICY IF EXISTS "Influencers can view their own verifications" ON social_media_verifications;
DROP POLICY IF EXISTS "Influencers can insert their own verifications" ON social_media_verifications;
DROP POLICY IF EXISTS "Influencers can update their own verifications" ON social_media_verifications;
DROP POLICY IF EXISTS "Businesses can view verified accounts" ON social_media_verifications;
DROP POLICY IF EXISTS "Admins can view all verifications" ON social_media_verifications;

CREATE POLICY "Influencers can view their own verifications" ON social_media_verifications
  FOR SELECT USING (
    influencer_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND user_role = 'influencer'
    )
  );

CREATE POLICY "Influencers can insert their own verifications" ON social_media_verifications
  FOR INSERT WITH CHECK (
    influencer_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND user_role = 'influencer'
    )
  );

CREATE POLICY "Influencers can update their own verifications" ON social_media_verifications
  FOR UPDATE USING (
    influencer_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND user_role = 'influencer'
    ) AND status IN ('pending', 'rejected')
  );

CREATE POLICY "Businesses can view verified accounts" ON social_media_verifications
  FOR SELECT USING (
    is_verified = TRUE AND 
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'business'
    )
  );

CREATE POLICY "Admins can manage all verifications" ON social_media_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Add comment to document the changes
COMMENT ON TABLE public.social_media_verifications IS 'Social media account verification with auto-generated 5-letter keys for post/bio verification';
COMMENT ON COLUMN public.social_media_verifications.verification_key IS 'Auto-generated 5-letter key for verification';
COMMENT ON COLUMN public.social_media_verifications.verification_method IS 'Method of verification: post (in caption) or bio (in profile)';
COMMENT ON COLUMN public.social_media_verifications.verification_proof_url IS 'Screenshot URL showing the verification key in post or bio';