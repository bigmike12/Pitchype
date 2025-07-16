-- =============================================================================
-- COMPREHENSIVE ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "service_role_full_access_profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "authenticated_users_select_basic_info" ON profiles;
DROP POLICY IF EXISTS "public_view_public_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_profiles_full_access" ON profiles;

-- 1. SERVICE ROLE - Full access for system operations
CREATE POLICY "service_role_full_access_profiles" ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. AUTHENTICATED USERS - Own profile access
CREATE POLICY "profiles_select_own_profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own_profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. AUTHENTICATED USERS - View basic info of other users (for searches, listings)
CREATE POLICY "authenticated_users_select_basic_info" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see basic info of others if profiles are public
    (profile_visibility = 'public') OR
    -- Or if they have a connection (implement your business logic here)
    (auth.uid() = id)
  );

-- 4. PUBLIC - Very limited access to public profiles only
CREATE POLICY "public_view_public_profiles" ON profiles
  FOR SELECT
  TO public
  USING (
    profile_visibility = 'public' AND
    account_status = 'active'
  );

-- 5. ADMIN USERS - Full access for admin operations
CREATE POLICY "admin_profiles_full_access" ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_role = 'admin'
      AND account_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_role = 'admin'
      AND account_status = 'active'
    )
  );

-- =============================================================================
-- INFLUENCER_PROFILES TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "service_role_full_access_influencer_profiles" ON influencer_profiles;
DROP POLICY IF EXISTS "influencer_select_own_profile" ON influencer_profiles;
DROP POLICY IF EXISTS "influencer_update_own_profile" ON influencer_profiles;
DROP POLICY IF EXISTS "influencer_insert_own_profile" ON influencer_profiles;
DROP POLICY IF EXISTS "influencer_delete_own_profile" ON influencer_profiles;
DROP POLICY IF EXISTS "authenticated_users_view_public_influencer_profiles" ON influencer_profiles;
DROP POLICY IF EXISTS "business_users_view_influencer_profiles" ON influencer_profiles;
DROP POLICY IF EXISTS "public_view_verified_influencer_profiles" ON influencer_profiles;
DROP POLICY IF EXISTS "admin_full_access_influencer_profiles" ON influencer_profiles;

-- 1. SERVICE ROLE - Full access for system operations
CREATE POLICY "service_role_full_access_influencer_profiles" ON influencer_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. INFLUENCER USERS - Own profile management
CREATE POLICY "influencer_select_own_profile" ON influencer_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'influencer'
    )
  );

CREATE POLICY "influencer_update_own_profile" ON influencer_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'influencer'
      AND profiles.account_status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'influencer'
      AND profiles.account_status = 'active'
    )
  );

CREATE POLICY "influencer_insert_own_profile" ON influencer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'influencer'
    )
  );

CREATE POLICY "influencer_delete_own_profile" ON influencer_profiles
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'influencer'
      AND profiles.account_status = 'active'
    )
  );

-- =============================================================================
-- BUSINESS_PROFILES TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "service_role_full_access_business_profiles" ON business_profiles;
DROP POLICY IF EXISTS "business_select_own_profile" ON business_profiles;
DROP POLICY IF EXISTS "business_update_own_profile" ON business_profiles;
DROP POLICY IF EXISTS "business_insert_own_profile" ON business_profiles;
DROP POLICY IF EXISTS "business_delete_own_profile" ON business_profiles;
DROP POLICY IF EXISTS "authenticated_users_view_public_business_profiles" ON business_profiles;
DROP POLICY IF EXISTS "influencer_users_view_business_profiles" ON business_profiles;
DROP POLICY IF EXISTS "public_view_verified_business_profiles" ON business_profiles;
DROP POLICY IF EXISTS "admin_full_access_business_profiles" ON business_profiles;

-- 1. SERVICE ROLE - Full access for system operations
CREATE POLICY "service_role_full_access_business_profiles" ON business_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. BUSINESS USERS - Own profile management
CREATE POLICY "business_select_own_profile" ON business_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'business'
    )
  );

CREATE POLICY "business_update_own_profile" ON business_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'business'
      AND profiles.account_status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'business'
      AND profiles.account_status = 'active'
    )
  );

CREATE POLICY "business_insert_own_profile" ON business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'business'
    )
  );

CREATE POLICY "business_delete_own_profile" ON business_profiles
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'business'
      AND profiles.account_status = 'active'
    )
  );

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes to optimize policy checks
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_visibility ON profiles(profile_visibility);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(id) WHERE id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_type_status ON profiles(user_role, account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_visibility_status ON profiles(profile_visibility, account_status);