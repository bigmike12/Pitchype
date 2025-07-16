-- Comprehensive fix for user registration database errors
-- Drop existing trigger and function to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get user role from metadata, default to 'influencer'
  user_role_val := COALESCE(NEW.raw_user_meta_data->>'user_role', 'influencer')::user_role;
  
  -- Insert into base profiles table
  INSERT INTO public.profiles (id, user_role, email, created_at, updated_at)
  VALUES (
    NEW.id,
    user_role_val,
    NEW.email,
    NOW(),
    NOW()
  );
  
  -- Insert into appropriate profile table based on user role
  IF user_role_val = 'influencer' THEN
    INSERT INTO public.influencer_profiles (id, first_name, last_name, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NOW(),
      NOW()
    );
  ELSIF user_role_val = 'business' THEN
    INSERT INTO public.business_profiles (id, first_name, last_name, company_name, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unnamed Company'),
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Re-raise the exception to prevent user creation
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix potential issues with the influencer_profiles table structure
-- Remove any columns that might be causing issues and ensure proper indexes exist

-- Drop problematic indexes if they exist
DROP INDEX IF EXISTS idx_influencer_profiles_niche;
DROP INDEX IF EXISTS idx_influencer_profiles_platforms;

-- Remove any columns that might not exist or cause issues
ALTER TABLE public.influencer_profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE public.influencer_profiles DROP COLUMN IF EXISTS niche_categories;
ALTER TABLE public.influencer_profiles DROP COLUMN IF EXISTS platforms;
ALTER TABLE public.influencer_profiles DROP COLUMN IF EXISTS is_verified;

-- Remove any columns that might not exist in business_profiles
ALTER TABLE public.business_profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE public.business_profiles DROP COLUMN IF EXISTS location;

-- Add missing columns if they don't exist
ALTER TABLE public.influencer_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.influencer_profiles ADD COLUMN IF NOT EXISTS categories TEXT[];
ALTER TABLE public.influencer_profiles ADD COLUMN IF NOT EXISTS languages TEXT[];

-- Recreate proper indexes
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_categories ON public.influencer_profiles USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_languages ON public.influencer_profiles USING GIN(languages);

-- Verify RLS policies are correct
-- Drop and recreate problematic policies

-- Fix the influencer profiles policy
DROP POLICY IF EXISTS "Influencers can view their own profile" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Anyone can view influencer profiles" ON public.influencer_profiles;

CREATE POLICY "Public can view influencer profiles" ON public.influencer_profiles
  FOR SELECT USING (true);

CREATE POLICY "Influencers can manage their own profile" ON public.influencer_profiles
  FOR ALL USING (auth.uid() = id);

-- Fix the business profiles policy
DROP POLICY IF EXISTS "Businesses can view their own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Anyone can view business profiles" ON public.business_profiles;

CREATE POLICY "Public can view business profiles" ON public.business_profiles
  FOR SELECT USING (true);

CREATE POLICY "Businesses can manage their own profile" ON public.business_profiles
  FOR ALL USING (auth.uid() = id);