-- Debug migration to identify user registration issues

-- First, let's verify the user_role enum exists and has correct values
DO $$
BEGIN
-- Check if user_role enum exists and log its values
IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
  RAISE NOTICE 'user_role enum exists';
  -- Log the enum values
  RAISE NOTICE 'user_role enum values: %', (SELECT array_agg(enumlabel) FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role'));
ELSE
  RAISE NOTICE 'user_role enum does not exist';
    END IF;
END $$;

-- Recreate the handle_new_user function with extensive debugging
-- Drop trigger first, then function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
  user_role_string TEXT;
BEGIN
  -- Log the incoming user data
  RAISE NOTICE 'handle_new_user called for user: %', NEW.id;
  RAISE NOTICE 'raw_user_meta_data: %', NEW.raw_user_meta_data;
  
  -- Get user role from metadata with detailed logging
  user_role_string := COALESCE(NEW.raw_user_meta_data->>'user_role', 'influencer');
  RAISE NOTICE 'user_role_string: %', user_role_string;
  
  -- Validate the user role
  IF user_role_string NOT IN ('business', 'influencer', 'admin') THEN
    RAISE EXCEPTION 'Invalid user_role: %. Must be business, influencer, or admin', user_role_string;
  END IF;
  
  user_role_val := user_role_string::user_role;
  RAISE NOTICE 'user_role_val after cast: %', user_role_val;
  
  -- Insert into base profiles table
  BEGIN
    INSERT INTO public.profiles (id, user_role, email, created_at, updated_at)
    VALUES (
      NEW.id,
      user_role_val,
      NEW.email,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Successfully inserted into profiles table';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error inserting into profiles table: %', SQLERRM;
  END;
  
  -- Insert into appropriate profile table based on user role
  IF user_role_val = 'influencer' THEN
    BEGIN
      INSERT INTO public.influencer_profiles (id, first_name, last_name, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NOW(),
        NOW()
      );
      RAISE NOTICE 'Successfully inserted into influencer_profiles table';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inserting into influencer_profiles table: %', SQLERRM;
    END;
  ELSIF user_role_val = 'business' THEN
    BEGIN
      INSERT INTO public.business_profiles (id, first_name, last_name, company_name, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unnamed Company'),
        NOW(),
        NOW()
      );
      RAISE NOTICE 'Successfully inserted into business_profiles table';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inserting into business_profiles table: %', SQLERRM;
    END;
  END IF;
  
  RAISE NOTICE 'handle_new_user completed successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details with full context
    RAISE EXCEPTION 'Error in handle_new_user for user % with metadata %: %', NEW.id, NEW.raw_user_meta_data, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
    RAISE NOTICE 'Debug migration completed - enhanced logging enabled for user registration';
END $$;