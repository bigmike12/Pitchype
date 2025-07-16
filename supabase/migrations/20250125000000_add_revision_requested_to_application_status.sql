-- Add 'revision_requested' and other missing statuses to application_status enum
-- This allows applications to be marked for revision when businesses request changes

-- Add missing values to the application_status enum
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'revision_requested';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'in_review';

-- Add comment for documentation
COMMENT ON TYPE application_status IS 'Application status: pending, approved, rejected, withdrawn, revision_requested, completed, in_review';

-- Update any existing applications that might have invalid statuses
-- This ensures data consistency
-- Note: Using only existing enum values to avoid transaction conflicts
UPDATE public.applications 
SET status = 'pending'
WHERE status NOT IN ('pending', 'approved', 'rejected', 'withdrawn');