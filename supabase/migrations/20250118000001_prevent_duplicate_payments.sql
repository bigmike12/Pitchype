-- Clean up duplicate payments and add unique constraint
-- This ensures only one payment record can exist per application

-- First, remove duplicate payments, keeping only the most recent one for each application
WITH duplicate_payments AS (
  SELECT 
    id,
    application_id,
    ROW_NUMBER() OVER (PARTITION BY application_id ORDER BY created_at DESC) as rn
  FROM public.payments
)
DELETE FROM public.payments 
WHERE id IN (
  SELECT id 
  FROM duplicate_payments 
  WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.payments 
ADD CONSTRAINT unique_payment_per_application 
UNIQUE (application_id);

-- Add index for better performance on payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_application_id_status 
ON public.payments(application_id, status);