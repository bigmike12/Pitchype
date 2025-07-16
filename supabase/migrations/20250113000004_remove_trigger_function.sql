-- Remove the handle_new_user trigger function that's causing 500 errors
-- This allows for manual user data insertion instead

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Add a comment to document the change
COMMENT ON SCHEMA public IS 'Removed handle_new_user trigger function - users must be manually inserted into profiles and role-specific tables';

-- Log the removal
DO $$
BEGIN
    RAISE NOTICE 'Successfully removed handle_new_user trigger and function';
    RAISE NOTICE 'Users must now be manually inserted into:';
    RAISE NOTICE '1. profiles table (id, user_role, email, created_at, updated_at)';
    RAISE NOTICE '2. influencer_profiles or business_profiles table based on user_role';
END $$;