-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'message', 'application', 'payment', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional data like message_id, application_id, etc.
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- For auto-cleanup
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type VARCHAR(50),
  notification_title VARCHAR(255),
  notification_message TEXT,
  notification_data JSONB DEFAULT '{}',
  expires_hours INTEGER DEFAULT 24
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    expires_at
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_data,
    NOW() + (expires_hours || ' hours')::INTERVAL
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read = true, updated_at = NOW()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(target_user_id UUID DEFAULT NULL)
RETURNS void AS $$
DECLARE
  user_to_update UUID;
BEGIN
  user_to_update := COALESCE(target_user_id, auth.uid());
  
  -- Only allow users to mark their own notifications as read
  IF user_to_update != auth.uid() THEN
    RAISE EXCEPTION 'Cannot mark other users notifications as read';
  END IF;
  
  UPDATE notifications
  SET read = true, updated_at = NOW()
  WHERE user_id = user_to_update AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup read notifications older than 24 hours
CREATE OR REPLACE FUNCTION cleanup_old_read_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE read = true 
    AND updated_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_notification(UUID, VARCHAR(50), VARCHAR(255), TEXT, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_read_notifications() TO service_role;

-- Create trigger to automatically create message notifications
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  campaign_title TEXT;
BEGIN
  -- Get recipient ID (the other participant in the conversation)
  SELECT 
    CASE 
      WHEN a.business_id = NEW.sender_id THEN a.influencer_id
      ELSE a.business_id
    END INTO recipient_id
  FROM applications a
  WHERE a.id = NEW.application_id;
  
  -- Don't create notification if recipient is the sender
  IF recipient_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;
  
  -- Get sender name
  SELECT 
    COALESCE(bp.company_name, ip.display_name, p.first_name || ' ' || p.last_name, 'Unknown User')
  INTO sender_name
  FROM profiles p
  LEFT JOIN business_profiles bp ON p.id = bp.id
  LEFT JOIN influencer_profiles ip ON p.id = ip.id
  WHERE p.id = NEW.sender_id;
  
  -- Get campaign title
  SELECT c.title INTO campaign_title
  FROM applications a
  JOIN campaigns c ON a.campaign_id = c.id
  WHERE a.id = NEW.application_id;
  
  -- Create notification
  PERFORM create_notification(
    recipient_id,
    'message',
    'New Message from ' || COALESCE(sender_name, 'Unknown User'),
    CASE 
      WHEN NEW.message_type = 'text' THEN LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END
      WHEN NEW.message_type = 'file' THEN 'Sent a file'
      WHEN NEW.message_type = 'image' THEN 'Sent an image'
      ELSE 'Sent a message'
    END,
    jsonb_build_object(
      'message_id', NEW.id,
      'application_id', NEW.application_id,
      'sender_id', NEW.sender_id,
      'campaign_title', campaign_title
    ),
    24 -- Expire after 24 hours
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for message notifications
DROP TRIGGER IF EXISTS trigger_create_message_notification ON messages;
CREATE TRIGGER trigger_create_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

COMMENT ON FUNCTION cleanup_expired_notifications() IS 'Call this function periodically to clean up expired notifications';
COMMENT ON FUNCTION cleanup_old_read_notifications() IS 'Call this function periodically to clean up read notifications older than 24 hours';