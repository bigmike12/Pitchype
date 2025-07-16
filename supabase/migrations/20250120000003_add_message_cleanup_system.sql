-- Add cleanup functions for messages and notifications

-- Function to cleanup messages after campaign completion
CREATE OR REPLACE FUNCTION cleanup_completed_campaign_messages()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete messages from applications where the campaign has been completed for more than 24 hours
  DELETE FROM messages
  WHERE application_id IN (
    SELECT a.id
    FROM applications a
    JOIN campaigns c ON a.campaign_id = c.id
    WHERE c.status = 'completed'
      AND c.updated_at < NOW() - INTERVAL '24 hours'
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old messages (older than 30 days regardless of campaign status)
CREATE OR REPLACE FUNCTION cleanup_old_messages(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup read notifications older than specified hours
CREATE OR REPLACE FUNCTION cleanup_read_notifications(hours_old INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE read = true 
    AND updated_at < NOW() - (hours_old || ' hours')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to run all cleanup operations
CREATE OR REPLACE FUNCTION run_cleanup_operations()
RETURNS TABLE(
  operation TEXT,
  deleted_count INTEGER
) AS $$
BEGIN
  -- Cleanup expired notifications
  RETURN QUERY SELECT 'expired_notifications'::TEXT, cleanup_expired_notifications();
  
  -- Cleanup read notifications older than 24 hours
  RETURN QUERY SELECT 'read_notifications'::TEXT, cleanup_read_notifications(24);
  
  -- Cleanup messages from completed campaigns (24 hours after completion)
  RETURN QUERY SELECT 'completed_campaign_messages'::TEXT, cleanup_completed_campaign_messages();
  
  -- Cleanup offline users
  PERFORM cleanup_offline_users();
  RETURN QUERY SELECT 'offline_users'::TEXT, 0; -- This function doesn't return count
  
  -- Optional: Cleanup very old messages (30 days)
  -- Uncomment the next line if you want to delete messages older than 30 days
  -- RETURN QUERY SELECT 'old_messages'::TEXT, cleanup_old_messages(30);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION cleanup_completed_campaign_messages() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_messages(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_read_notifications(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION run_cleanup_operations() TO service_role;

-- Add indexes for better cleanup performance
CREATE INDEX IF NOT EXISTS idx_messages_application_id ON messages(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_updated_at ON campaigns(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON applications(campaign_id);

-- Comments for documentation
COMMENT ON FUNCTION cleanup_completed_campaign_messages() IS 'Deletes messages from applications where campaigns have been completed for more than 24 hours';
COMMENT ON FUNCTION cleanup_old_messages(INTEGER) IS 'Deletes messages older than specified days (default 30 days)';
COMMENT ON FUNCTION cleanup_read_notifications(INTEGER) IS 'Deletes read notifications older than specified hours (default 24 hours)';
COMMENT ON FUNCTION run_cleanup_operations() IS 'Runs all cleanup operations and returns summary. Call this function periodically via cron job';

-- Example usage (commented out - would typically be run by a scheduled job):
-- SELECT * FROM run_cleanup_operations();