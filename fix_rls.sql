-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "service_role_full_access_users" ON users;
DROP POLICY IF EXISTS "users_insert_own_profile" ON users;
DROP POLICY IF EXISTS "service_role_full_access_influencer_profiles" ON influencer_profiles;
DROP POLICY IF EXISTS "influencer_profiles_insert_own_profile" ON influencer_profiles;
DROP POLICY IF EXISTS "service_role_full_access_business_profiles" ON business_profiles;
DROP POLICY IF EXISTS "business_profiles_insert_own_profile" ON business_profiles;

-- SERVICE ROLE - Full access for system operations
CREATE POLICY "service_role_full_access_users" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- USERS - Allow insert for authenticated users
CREATE POLICY "users_insert_own_profile" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- INFLUENCER PROFILES - Service role access
CREATE POLICY "service_role_full_access_influencer_profiles" ON influencer_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- INFLUENCER PROFILES - Allow insert for authenticated users
CREATE POLICY "influencer_profiles_insert_own_profile" ON influencer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- BUSINESS PROFILES - Service role access
CREATE POLICY "service_role_full_access_business_profiles" ON business_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- BUSINESS PROFILES - Allow insert for authenticated users
CREATE POLICY "business_profiles_insert_own_profile" ON business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);