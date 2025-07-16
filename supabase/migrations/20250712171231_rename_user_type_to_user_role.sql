-- Rename user_type to user_role

-- First, check if user_type enum exists and rename it, or create user_role if it doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    ALTER TYPE user_type RENAME TO user_role;
    RAISE NOTICE 'Renamed user_type enum to user_role';
  ELSIF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('business', 'influencer', 'admin');
    RAISE NOTICE 'Created user_role enum';
  ELSE
    RAISE NOTICE 'user_role enum already exists';
  END IF;
END $$;

-- Rename the column in the profiles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
    ALTER TABLE public.profiles RENAME COLUMN user_type TO user_role;
    RAISE NOTICE 'Renamed user_type column to user_role';
  ELSE
    RAISE NOTICE 'user_type column does not exist or already renamed';
  END IF;
END $$;

-- Drop the old index and create a new one with the correct name
DROP INDEX IF EXISTS idx_profiles_user_type;
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);

-- Update any existing functions that reference the old names
-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
      COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();