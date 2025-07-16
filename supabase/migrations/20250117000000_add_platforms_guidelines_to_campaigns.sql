-- Add platforms and guidelines columns to campaigns table
ALTER TABLE campaigns 
ADD COLUMN platforms text[] DEFAULT NULL,
ADD COLUMN guidelines text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN campaigns.platforms IS 'Target social media platforms for the campaign';
COMMENT ON COLUMN campaigns.guidelines IS 'Content creation guidelines and brand requirements';