-- Create user_presence table for tracking online status
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON user_presence(is_online);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen);

-- Enable RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all presence data" ON user_presence
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own presence" ON user_presence
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(user_uuid UUID, online_status BOOLEAN)
RETURNS void AS $$
BEGIN
  INSERT INTO user_presence (user_id, is_online, last_seen, updated_at)
  VALUES (user_uuid, online_status, NOW(), NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark users as offline after 5 minutes of inactivity
CREATE OR REPLACE FUNCTION cleanup_offline_users()
RETURNS void AS $$
BEGIN
  UPDATE user_presence
  SET is_online = false,
      updated_at = NOW()
  WHERE is_online = true
    AND last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to be called periodically to clean up offline users
-- This would typically be called by a cron job or scheduled function
COMMENT ON FUNCTION cleanup_offline_users() IS 'Call this function periodically to mark inactive users as offline';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_user_presence(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_offline_users() TO service_role;