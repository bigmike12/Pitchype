-- =============================================================================
-- COMPREHENSIVE ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "service_role_full_access_users" ON users;
DROP POLICY IF EXISTS "users_select_own_profile" ON users;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_insert_own_profile" ON users;
DROP POLICY IF EXISTS "authenticated_users_select_basic_info" ON users;
DROP POLICY IF EXISTS "public_view_public_profiles" ON users;
DROP POLICY IF EXISTS "admin_users_full_access" ON users;

-- 1. SERVICE ROLE - Full access for system operations
CREATE POLICY "service_role_full_access_users" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. AUTHENTICATED USERS - Own profile access
CREATE POLICY "users_select_own_profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. AUTHENTICATED USERS - View basic info of other users (for searches, listings)
CREATE POLICY "authenticated_users_select_basic_info" ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see basic info of others if profiles are public
    (profile_visibility = 'public') OR
    -- Or if they have a connection (implement your business logic here)
    (auth.uid() = id)
  );

-- 4. PUBLIC - Very limited access to public profiles only
CREATE POLICY "public_view_public_profiles" ON users
  FOR SELECT
  TO public
  USING (
    profile_visibility = 'public' AND
    account_status = 'active'
  );

-- 5. ADMIN USERS - Full access for admin operations
CREATE POLICY "admin_users_full_access" ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
      AND account_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
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
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'influencer'
    )
  );

CREATE POLICY "influencer_update_own_profile" ON influencer_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'influencer'
      AND users.account_status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'influencer'
      AND users.account_status = 'active'
    )
  );

CREATE POLICY "influencer_insert_own_profile" ON influencer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'influencer'
    )
  );

CREATE POLICY "influencer_delete_own_profile" ON influencer_profiles
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'influencer'
      AND users.account_status = 'active'
    )
  );

-- 3. AUTHENTICATED USERS - View public influencer profiles
CREATE POLICY "authenticated_users_view_public_influencer_profiles" ON influencer_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = influencer_profiles.id
      AND users.profile_visibility = 'public'
      AND users.account_status = 'active'
    )
  );

-- 4. BUSINESS USERS - Enhanced access to influencer profiles (for partnerships)
CREATE POLICY "business_users_view_influencer_profiles" ON influencer_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users requester
      WHERE requester.id = auth.uid()
      AND requester.user_type = 'business'
      AND requester.account_status = 'active'
    )
    AND
    EXISTS (
      SELECT 1 FROM users profile_owner
      WHERE profile_owner.id = influencer_profiles.id
      AND (
        profile_owner.profile_visibility = 'public' OR
        profile_owner.profile_visibility = 'business_visible'
      )
      AND profile_owner.account_status = 'active'
    )
  );

-- 5. PUBLIC - Very limited access to verified public profiles
CREATE POLICY "public_view_verified_influencer_profiles" ON influencer_profiles
  FOR SELECT
  TO public
  USING (
    is_verified = true AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = influencer_profiles.id
      AND users.profile_visibility = 'public'
      AND users.account_status = 'active'
    )
  );

-- 6. ADMIN - Full access for admin operations
CREATE POLICY "admin_full_access_influencer_profiles" ON influencer_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
      AND account_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
      AND account_status = 'active'
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
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'business'
    )
  );

CREATE POLICY "business_update_own_profile" ON business_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'business'
      AND users.account_status = 'active'
    )
  )
  WITH CHECK (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'business'
      AND users.account_status = 'active'
    )
  );

CREATE POLICY "business_insert_own_profile" ON business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'business'
    )
  );

CREATE POLICY "business_delete_own_profile" ON business_profiles
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'business'
      AND users.account_status = 'active'
    )
  );

-- 3. AUTHENTICATED USERS - View public business profiles
CREATE POLICY "authenticated_users_view_public_business_profiles" ON business_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = business_profiles.id
      AND users.profile_visibility = 'public'
      AND users.account_status = 'active'
    )
  );

-- 4. INFLUENCER USERS - Enhanced access to business profiles (for partnerships)
CREATE POLICY "influencer_users_view_business_profiles" ON business_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users requester
      WHERE requester.id = auth.uid()
      AND requester.user_type = 'influencer'
      AND requester.account_status = 'active'
    )
    AND
    EXISTS (
      SELECT 1 FROM users profile_owner
      WHERE profile_owner.id = business_profiles.id
      AND (
        profile_owner.profile_visibility = 'public' OR
        profile_owner.profile_visibility = 'influencer_visible'
      )
      AND profile_owner.account_status = 'active'
    )
  );

-- 5. PUBLIC - Very limited access to verified public profiles
CREATE POLICY "public_view_verified_business_profiles" ON business_profiles
  FOR SELECT
  TO public
  USING (
    is_verified = true AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = business_profiles.id
      AND users.profile_visibility = 'public'
      AND users.account_status = 'active'
    )
  );

-- 6. ADMIN - Full access for admin operations
CREATE POLICY "admin_full_access_business_profiles" ON business_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
      AND account_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
      AND account_status = 'active'
    )
  );

-- =============================================================================
-- ADDITIONAL SECURITY ENHANCEMENTS
-- =============================================================================

-- Function to check if user can view profile based on privacy settings
CREATE OR REPLACE FUNCTION can_view_profile(profile_user_id UUID, requesting_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_visibility TEXT;
  profile_status TEXT;
  requester_type TEXT;
BEGIN
  -- Get profile visibility and status
  SELECT users.profile_visibility, users.account_status
  INTO profile_visibility, profile_status
  FROM users
  WHERE users.id = profile_user_id;
  
  -- Get requester type
  SELECT users.user_type
  INTO requester_type
  FROM users
  WHERE users.id = requesting_user_id;
  
  -- Check conditions
  IF profile_status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  IF profile_visibility = 'public' THEN
    RETURN TRUE;
  END IF;
  
  IF profile_visibility = 'private' AND profile_user_id = requesting_user_id THEN
    RETURN TRUE;
  END IF;
  
  IF profile_visibility = 'business_visible' AND requester_type = 'business' THEN
    RETURN TRUE;
  END IF;
  
  IF profile_visibility = 'influencer_visible' AND requester_type = 'influencer' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes to optimize policy checks
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_profile_visibility ON users(profile_visibility);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id) WHERE id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_type_status ON users(user_type, account_status);
CREATE INDEX IF NOT EXISTS idx_users_visibility_status ON users(profile_visibility, account_status);

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON POLICY "service_role_full_access_users" ON users IS 
'Service role has full access for system operations like user creation, data migration, etc.';

COMMENT ON POLICY "users_select_own_profile" ON users IS 
'Users can view their own complete profile data';

COMMENT ON POLICY "authenticated_users_select_basic_info" ON users IS 
'Authenticated users can view basic info of other users based on privacy settings';

COMMENT ON POLICY "public_view_public_profiles" ON users IS 
'Anonymous users can only view public profiles that are active';

COMMENT ON POLICY "business_users_view_influencer_profiles" ON influencer_profiles IS 
'Business users can view influencer profiles for partnership opportunities';

COMMENT ON POLICY "influencer_users_view_business_profiles" ON business_profiles IS 
'Influencer users can view business profiles for partnership opportunities';

-- =============================================================================
-- SECURITY VALIDATION QUERIES
-- =============================================================================

-- Test queries to validate policies (run these to test)
/*
-- Test 1: Check if user can see their own profile
SELECT * FROM users WHERE id = auth.uid();

-- Test 2: Check if business user can see influencer profiles
SELECT ip.* FROM influencer_profiles ip
JOIN users u ON u.id = ip.id
WHERE u.profile_visibility = 'public';

-- Test 3: Check public access (should be very limited)
SET ROLE anon;
SELECT * FROM users WHERE profile_visibility = 'public';
RESET ROLE;

-- Test 4: Check admin access
SELECT * FROM users WHERE user_type = 'admin';
*/