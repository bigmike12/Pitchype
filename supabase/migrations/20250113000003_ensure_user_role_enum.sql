-- Ensure user_role enum exists

-- Create the user_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('business', 'influencer', 'admin');
    RAISE NOTICE 'Created user_role enum';
  ELSE
    RAISE NOTICE 'user_role enum already exists';
  END IF;
END $$;

-- Add comment to document the enum
COMMENT ON TYPE user_role IS 'User role enum: business, influencer, admin';