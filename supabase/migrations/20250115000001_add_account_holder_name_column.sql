-- Add account_holder_name column to influencer_bank_details table
-- The existing account_name column will be kept for backward compatibility

ALTER TABLE public.influencer_bank_details 
ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255);

-- Copy data from account_name to account_holder_name for existing records
UPDATE public.influencer_bank_details 
SET account_holder_name = account_name 
WHERE account_holder_name IS NULL;

-- Make account_holder_name NOT NULL after copying data
ALTER TABLE public.influencer_bank_details 
ALTER COLUMN account_holder_name SET NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN public.influencer_bank_details.account_holder_name IS 'Name of the account holder (required field)';
COMMENT ON COLUMN public.influencer_bank_details.account_name IS 'Legacy account name field (kept for backward compatibility)';