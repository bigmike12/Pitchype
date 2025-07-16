-- Create notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('campaign', 'application', 'payment', 'message', 'system')),
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow system/admin to insert notifications for any user
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Create function to send real-time notifications
CREATE OR REPLACE FUNCTION notify_user_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Send real-time notification via Supabase realtime
  PERFORM pg_notify(
    'notification_' || NEW.user_id::text,
    json_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'message', NEW.message,
      'type', NEW.type,
      'data', NEW.data,
      'is_read', NEW.is_read,
      'created_at', NEW.created_at
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for real-time notifications
CREATE TRIGGER trigger_notify_user_notification
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_notification();

-- Insert some sample notifications for testing
INSERT INTO notifications (user_id, title, message, type, data) 
SELECT 
  u.id,
  'Welcome to PitchHype!',
  'Thank you for joining our platform. Start exploring campaigns and opportunities.',
  'system',
  '{}'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.type = 'system' AND n.title = 'Welcome to PitchHype!'
);