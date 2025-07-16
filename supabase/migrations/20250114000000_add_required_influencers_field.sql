-- Add required_influencers field to campaigns table

ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS required_influencers INTEGER DEFAULT 1;

-- Add comment to document the field
COMMENT ON COLUMN public.campaigns.required_influencers IS 'Number of influencers required for this campaign';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_required_influencers ON public.campaigns(required_influencers);

-- Add a function to check if campaign has enough approved applications
CREATE OR REPLACE FUNCTION check_campaign_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is an approval of an application
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Count approved applications for this campaign
    DECLARE
      approved_count INTEGER;
      required_count INTEGER;
      campaign_status TEXT;
    BEGIN
      SELECT COUNT(*) INTO approved_count
      FROM public.applications
      WHERE campaign_id = NEW.campaign_id AND status = 'approved';
      
      SELECT required_influencers, status INTO required_count, campaign_status
      FROM public.campaigns
      WHERE id = NEW.campaign_id;
      
      -- If we have enough approved applications and campaign is still active, mark as completed
      IF approved_count >= required_count AND campaign_status = 'active' THEN
        UPDATE public.campaigns
        SET status = 'completed'
        WHERE id = NEW.campaign_id;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically complete campaigns when target is reached
CREATE TRIGGER campaign_completion_trigger
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION check_campaign_completion();