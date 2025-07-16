-- Update submissions table to use 'pending' as default status instead of 'submitted'
-- This reflects the proper workflow where submissions await business review

-- Drop the existing check constraint first
ALTER TABLE public.submissions 
DROP CONSTRAINT IF EXISTS submissions_status_check;

-- Update any existing status values to match the new constraint
-- Map old statuses to new ones
UPDATE public.submissions 
SET status = CASE 
  WHEN status = 'submitted' THEN 'pending'
  WHEN status = 'done' THEN 'approved'
  WHEN status NOT IN ('pending', 'under_review', 'approved', 'rejected', 'revision_requested') THEN 'pending'
  ELSE status
END;

-- Add the new check constraint with 'pending' instead of 'submitted'
ALTER TABLE public.submissions 
ADD CONSTRAINT submissions_status_check 
CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'revision_requested'));

-- Update the default value for the status column
ALTER TABLE public.submissions 
ALTER COLUMN status SET DEFAULT 'pending';

-- Update the RLS policy to allow influencers to update pending submissions
DROP POLICY IF EXISTS "Influencers can update their own submissions" ON public.submissions;

CREATE POLICY "Influencers can update their own submissions" ON public.submissions
  FOR UPDATE USING (influencer_id = auth.uid() AND status IN ('pending', 'revision_requested'));

-- Add comment to document the change
COMMENT ON COLUMN public.submissions.status IS 'Submission status: pending (awaiting review), under_review, approved, rejected, revision_requested';