-- Add 'in-progress' to campaign_status enum for uniformity

ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'in-progress';

-- Add comment for documentation
COMMENT ON TYPE campaign_status IS 'Campaign status: draft, active, paused, completed, cancelled, in-progress';