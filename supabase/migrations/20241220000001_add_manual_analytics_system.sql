-- Create campaign_analytics table for manual analytics submissions
CREATE TABLE campaign_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Analytics data
  platform VARCHAR(50) NOT NULL, -- 'instagram', 'youtube', 'tiktok', 'twitter'
  post_url TEXT NOT NULL,
  post_type VARCHAR(50) NOT NULL, -- 'post', 'story', 'reel', 'video', 'tweet'
  
  -- Metrics
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  reach_count INTEGER DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  
  -- Engagement metrics
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Submission details
  screenshot_urls TEXT[] DEFAULT '{}',
  additional_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Verification status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'disputed')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_media_verifications table
CREATE TABLE social_media_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  
  -- Platform details
  platform VARCHAR(50) NOT NULL, -- 'instagram', 'youtube', 'tiktok', 'twitter'
  username VARCHAR(255) NOT NULL,
  profile_url TEXT NOT NULL,
  follower_count INTEGER DEFAULT 0,
  
  -- Verification proof
  verification_screenshot_url TEXT,
  verification_video_url TEXT,
  verification_code VARCHAR(50), -- Code they need to post/display
  
  -- Status and review
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- Verification badge
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one verification per platform per influencer
  UNIQUE(influencer_id, platform)
);

-- Create influencer_bank_details table
CREATE TABLE influencer_bank_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  
  -- Bank information
  bank_name VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  routing_number VARCHAR(50),
  swift_code VARCHAR(20),
  
  -- Address information
  bank_address TEXT,
  account_holder_address TEXT,
  
  -- Additional details
  currency VARCHAR(3) DEFAULT 'USD',
  account_type VARCHAR(20) DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings', 'business')),
  
  -- Security and verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_method VARCHAR(50), -- 'micro_deposit', 'instant', 'manual'
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one primary bank account per influencer
  CONSTRAINT unique_primary_bank EXCLUDE (influencer_id WITH =) WHERE (is_primary = TRUE)
);

-- Create indexes for better performance
CREATE INDEX idx_campaign_analytics_application_id ON campaign_analytics(application_id);
CREATE INDEX idx_campaign_analytics_influencer_id ON campaign_analytics(influencer_id);
CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_platform ON campaign_analytics(platform);
CREATE INDEX idx_campaign_analytics_verification_status ON campaign_analytics(verification_status);

CREATE INDEX idx_social_media_verifications_influencer_id ON social_media_verifications(influencer_id);
CREATE INDEX idx_social_media_verifications_platform ON social_media_verifications(platform);
CREATE INDEX idx_social_media_verifications_status ON social_media_verifications(status);
CREATE INDEX idx_social_media_verifications_is_verified ON social_media_verifications(is_verified);

CREATE INDEX idx_influencer_bank_details_influencer_id ON influencer_bank_details(influencer_id);
CREATE INDEX idx_influencer_bank_details_is_primary ON influencer_bank_details(is_primary);
CREATE INDEX idx_influencer_bank_details_is_active ON influencer_bank_details(is_active);

-- Enable RLS
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_bank_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_analytics
CREATE POLICY "Influencers can view their own analytics" ON campaign_analytics
  FOR SELECT USING (influencer_id = auth.uid());

CREATE POLICY "Influencers can insert their own analytics" ON campaign_analytics
  FOR INSERT WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Influencers can update their own analytics" ON campaign_analytics
  FOR UPDATE USING (influencer_id = auth.uid());

CREATE POLICY "Businesses can view analytics for their campaigns" ON campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns c 
      WHERE c.id = campaign_analytics.campaign_id 
      AND c.business_id = auth.uid()
    )
  );

CREATE POLICY "Businesses can verify analytics for their campaigns" ON campaign_analytics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns c 
      WHERE c.id = campaign_analytics.campaign_id 
      AND c.business_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all analytics" ON campaign_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role = 'admin'
    )
  );

-- RLS Policies for social_media_verifications
CREATE POLICY "Influencers can view their own verifications" ON social_media_verifications
  FOR SELECT USING (influencer_id = auth.uid());

CREATE POLICY "Influencers can insert their own verifications" ON social_media_verifications
  FOR INSERT WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Influencers can update their own verifications" ON social_media_verifications
  FOR UPDATE USING (influencer_id = auth.uid() AND status = 'pending');

CREATE POLICY "Businesses can view verified accounts" ON social_media_verifications
  FOR SELECT USING (is_verified = TRUE);

CREATE POLICY "Admins can view all verifications" ON social_media_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role = 'admin'
    )
  );

-- RLS Policies for influencer_bank_details
CREATE POLICY "Influencers can view their own bank details" ON influencer_bank_details
  FOR SELECT USING (influencer_id = auth.uid());

CREATE POLICY "Influencers can insert their own bank details" ON influencer_bank_details
  FOR INSERT WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Influencers can update their own bank details" ON influencer_bank_details
  FOR UPDATE USING (influencer_id = auth.uid());

CREATE POLICY "Influencers can delete their own bank details" ON influencer_bank_details
  FOR DELETE USING (influencer_id = auth.uid());

CREATE POLICY "Admins can view all bank details" ON influencer_bank_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role = 'admin'
    )
  );

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_campaign_analytics_updated_at
  BEFORE UPDATE ON campaign_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_verifications_updated_at
  BEFORE UPDATE ON social_media_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_bank_details_updated_at
  BEFORE UPDATE ON influencer_bank_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();