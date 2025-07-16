-- Rename users table to profiles

-- First, drop the trigger to avoid conflicts during the rename
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Check if users table exists and rename it to profiles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE public.users RENAME TO profiles;
    RAISE NOTICE 'Renamed users table to profiles';
  ELSE
    RAISE NOTICE 'Users table does not exist or already renamed';
  END IF;
END $$;

-- Update all foreign key constraints that reference the old table name
-- Campaigns table
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_business_id_fkey;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_business_id_fkey 
  FOREIGN KEY (business_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Applications table
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_influencer_id_fkey;
ALTER TABLE public.applications ADD CONSTRAINT applications_influencer_id_fkey 
  FOREIGN KEY (influencer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Messages table
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Influencer profiles table
ALTER TABLE public.influencer_profiles DROP CONSTRAINT IF EXISTS influencer_profiles_id_fkey;
ALTER TABLE public.influencer_profiles ADD CONSTRAINT influencer_profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Business profiles table
ALTER TABLE public.business_profiles DROP CONSTRAINT IF EXISTS business_profiles_id_fkey;
ALTER TABLE public.business_profiles ADD CONSTRAINT business_profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update indexes
DROP INDEX IF EXISTS idx_users_user_role;
DROP INDEX IF EXISTS idx_users_email;

-- Create new indexes for profiles table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
    RAISE NOTICE 'Created indexes for profiles table';
  END IF;
END $$;

-- Update RLS policies
-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
  END IF;
END $$;

-- Create new RLS policies for profiles table
-- Drop any existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

CREATE POLICY "Admin can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the trigger function with updated table name
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment to document the change
COMMENT ON TABLE public.profiles IS 'User profiles table (renamed from users table)';