-- Update trigger to act as backup only when manual creation hasn't occurred

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create backup trigger function that only acts when user doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
  user_role_string TEXT;
  user_exists BOOLEAN;
BEGIN
  -- Check if user already exists in our profiles table (manual creation already happened)
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'User % already exists in profiles table, skipping trigger creation', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Only proceed if user metadata contains user_role (indicating this should be processed)
  IF NEW.raw_user_meta_data IS NULL OR NEW.raw_user_meta_data->>'user_role' IS NULL THEN
    RAISE NOTICE 'No user_role in metadata for user %, skipping trigger creation', NEW.id;
    RETURN NEW;
  END IF;
  
  RAISE NOTICE 'Trigger backup: Creating user profile for user % with metadata %', NEW.id, NEW.raw_user_meta_data;
  
  -- Get user role from metadata with detailed logging
  user_role_string := COALESCE(NEW.raw_user_meta_data->>'user_role', 'influencer');
  RAISE NOTICE 'Trigger backup: user_role_string: %', user_role_string;
  
  -- Validate the user role
  IF user_role_string NOT IN ('business', 'influencer', 'admin') THEN
    RAISE EXCEPTION 'Trigger backup: Invalid user_role: %. Must be business, influencer, or admin', user_role_string;
  END IF;
  
  user_role_val := user_role_string::user_role;
  RAISE NOTICE 'Trigger backup: user_role_val after cast: %', user_role_val;
  
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
    RAISE NOTICE 'Trigger backup: Successfully inserted into profiles table';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Trigger backup: User % already exists in profiles table (race condition), skipping', NEW.id;
      RETURN NEW;
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Trigger backup: Error inserting into profiles table: %', SQLERRM;
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
      RAISE NOTICE 'Trigger backup: Successfully inserted into influencer_profiles table';
    EXCEPTION
      WHEN unique_violation THEN
        RAISE NOTICE 'Trigger backup: Influencer profile for user % already exists, skipping', NEW.id;
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Trigger backup: Error inserting into influencer_profiles table: %', SQLERRM;
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
      RAISE NOTICE 'Trigger backup: Successfully inserted into business_profiles table';
    EXCEPTION
      WHEN unique_violation THEN
        RAISE NOTICE 'Trigger backup: Business profile for user % already exists, skipping', NEW.id;
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Trigger backup: Error inserting into business_profiles table: %', SQLERRM;
    END;
  END IF;
  
  RAISE NOTICE 'Trigger backup: handle_new_user completed successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Trigger backup: Error in handle_new_user for user % with metadata %: %', NEW.id, NEW.raw_user_meta_data, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
    RAISE NOTICE 'Updated trigger to act as backup only - manual user creation takes precedence';
END $$;