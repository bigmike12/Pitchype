-- Fix handle_new_user trigger function to include proper error handling and timestamps

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
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;