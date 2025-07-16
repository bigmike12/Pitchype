-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Business users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can view their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can delete their campaigns" ON campaigns;

-- For INSERT (creating campaign)
CREATE POLICY "Business users can create campaigns"
ON campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = business_id AND
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'business'
  )
);

-- For SELECT (business users see their own campaigns)
CREATE POLICY "Business users can view their own campaigns"
ON campaigns
FOR SELECT
TO authenticated
USING (
  business_id = auth.uid()
);

-- For SELECT (anyone can view active campaigns)
CREATE POLICY "Anyone can view active campaigns"
ON campaigns
FOR SELECT
TO public
USING (
  status = 'active'
);

-- For UPDATE (business users can update their own campaigns)
CREATE POLICY "Business users can update their campaigns"
ON campaigns
FOR UPDATE
TO authenticated
USING (
  business_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'business'
  )
)
WITH CHECK (
  business_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'business'
  )
);

-- For DELETE (business users can delete their own campaigns)
CREATE POLICY "Business users can delete their campaigns"
ON campaigns
FOR DELETE
TO authenticated
USING (
  business_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'business'
  )
);