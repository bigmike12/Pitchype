-- Create influencer_reviews table for businesses to review influencers after campaign completion
CREATE TABLE influencer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  
  -- Review categories (1-5 scale)
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  
  -- Recommendation
  would_work_again BOOLEAN DEFAULT false,
  
  -- Metadata
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one review per business-influencer-campaign combination
  UNIQUE(campaign_id, business_id, influencer_id)
);

-- Create indexes for better performance
CREATE INDEX idx_influencer_reviews_campaign_id ON influencer_reviews(campaign_id);
CREATE INDEX idx_influencer_reviews_business_id ON influencer_reviews(business_id);
CREATE INDEX idx_influencer_reviews_influencer_id ON influencer_reviews(influencer_id);
CREATE INDEX idx_influencer_reviews_rating ON influencer_reviews(rating);
CREATE INDEX idx_influencer_reviews_is_public ON influencer_reviews(is_public);
CREATE INDEX idx_influencer_reviews_created_at ON influencer_reviews(created_at);

-- Enable RLS
ALTER TABLE influencer_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Businesses can view and manage their own reviews
CREATE POLICY "Businesses can view their own reviews" ON influencer_reviews
  FOR SELECT USING (business_id = auth.uid());

CREATE POLICY "Businesses can create reviews for their campaigns" ON influencer_reviews
  FOR INSERT WITH CHECK (
    business_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM campaigns c 
      WHERE c.id = campaign_id AND c.business_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM applications a 
      WHERE a.id = application_id 
      AND a.campaign_id = campaign_id 
      AND a.influencer_id = influencer_reviews.influencer_id
      AND a.status = 'approved'
    )
  );

CREATE POLICY "Businesses can update their own reviews" ON influencer_reviews
  FOR UPDATE USING (business_id = auth.uid());

CREATE POLICY "Businesses can delete their own reviews" ON influencer_reviews
  FOR DELETE USING (business_id = auth.uid());

-- Influencers can view public reviews about them
CREATE POLICY "Influencers can view public reviews about them" ON influencer_reviews
  FOR SELECT USING (
    influencer_id = auth.uid() AND is_public = true
  );

-- Public can view public reviews
CREATE POLICY "Public can view public reviews" ON influencer_reviews
  FOR SELECT USING (is_public = true);

-- Admins can view and manage all reviews
CREATE POLICY "Admins can manage all reviews" ON influencer_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_influencer_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_influencer_reviews_updated_at_trigger
  BEFORE UPDATE ON influencer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_influencer_reviews_updated_at();

-- Create function to calculate influencer average rating
CREATE OR REPLACE FUNCTION calculate_influencer_average_rating(influencer_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT ROUND(AVG(rating)::DECIMAL, 2)
  INTO avg_rating
  FROM influencer_reviews
  WHERE influencer_id = influencer_uuid
  AND is_public = true;
  
  RETURN COALESCE(avg_rating, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Create function to get influencer review stats
CREATE OR REPLACE FUNCTION get_influencer_review_stats(influencer_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_reviews', COUNT(*),
    'average_rating', ROUND(AVG(rating)::DECIMAL, 2),
    'five_star', COUNT(*) FILTER (WHERE rating = 5),
    'four_star', COUNT(*) FILTER (WHERE rating = 4),
    'three_star', COUNT(*) FILTER (WHERE rating = 3),
    'two_star', COUNT(*) FILTER (WHERE rating = 2),
    'one_star', COUNT(*) FILTER (WHERE rating = 1),
    'would_work_again_percentage', 
      CASE 
        WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE would_work_again = true)::DECIMAL / COUNT(*)) * 100, 1)
        ELSE 0
      END
  )
  INTO result
  FROM influencer_reviews
  WHERE influencer_id = influencer_uuid
  AND is_public = true;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE influencer_reviews IS 'Reviews and ratings for influencers by businesses after campaign completion';
COMMENT ON COLUMN influencer_reviews.rating IS 'Overall rating from 1-5 stars';
COMMENT ON COLUMN influencer_reviews.communication_rating IS 'Rating for communication skills (1-5)';
COMMENT ON COLUMN influencer_reviews.content_quality_rating IS 'Rating for content quality (1-5)';
COMMENT ON COLUMN influencer_reviews.professionalism_rating IS 'Rating for professionalism (1-5)';
COMMENT ON COLUMN influencer_reviews.timeliness_rating IS 'Rating for meeting deadlines (1-5)';
COMMENT ON COLUMN influencer_reviews.would_work_again IS 'Whether the business would work with this influencer again';
COMMENT ON COLUMN influencer_reviews.is_public IS 'Whether the review is visible to public and influencer';
COMMENT ON COLUMN influencer_reviews.is_featured IS 'Whether the review is featured (admin controlled)';