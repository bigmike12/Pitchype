-- Create submissions table to store all submission data separately from applications
-- This allows for better organization and retrieval of submission content

CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Submission content
  title TEXT,
  description TEXT,
  notes TEXT,
  
  -- Media attachments
  images JSONB DEFAULT '[]', -- Array of image objects with url, description, alt_text
  videos JSONB DEFAULT '[]', -- Array of video objects with url, description, thumbnail_url
  links JSONB DEFAULT '[]',  -- Array of link objects with url, title, description
  documents JSONB DEFAULT '[]', -- Array of document objects with url, filename, type
  
  -- Legacy support for existing attachments
  attachments JSONB DEFAULT '[]', -- Keep for backward compatibility
  
  -- Status and workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'revision_requested')),
  review_notes TEXT,
  revision_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  auto_approve_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one submission per application
  UNIQUE(application_id)
);

-- Create indexes for better performance
CREATE INDEX idx_submissions_application_id ON public.submissions(application_id);
CREATE INDEX idx_submissions_influencer_id ON public.submissions(influencer_id);
CREATE INDEX idx_submissions_campaign_id ON public.submissions(campaign_id);
CREATE INDEX idx_submissions_business_id ON public.submissions(business_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_submitted_at ON public.submissions(submitted_at);
CREATE INDEX idx_submissions_auto_approve_date ON public.submissions(auto_approve_date);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Influencers can view and update their own submissions
CREATE POLICY "Influencers can view their own submissions" ON public.submissions
  FOR SELECT USING (influencer_id = auth.uid());

CREATE POLICY "Influencers can create their own submissions" ON public.submissions
  FOR INSERT WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Influencers can update their own submissions" ON public.submissions
  FOR UPDATE USING (influencer_id = auth.uid() AND status IN ('pending', 'revision_requested'));

-- Businesses can view submissions for their campaigns
CREATE POLICY "Businesses can view submissions for their campaigns" ON public.submissions
  FOR SELECT USING (business_id = auth.uid());

CREATE POLICY "Businesses can update submissions for their campaigns" ON public.submissions
  FOR UPDATE USING (business_id = auth.uid());

-- Admins can view and manage all submissions
CREATE POLICY "Admins can manage all submissions" ON public.submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_submissions_updated_at_trigger
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_submissions_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.submissions IS 'Stores all submission data including media, links, and review status';
COMMENT ON COLUMN public.submissions.images IS 'Array of image objects: [{url, description, alt_text, width, height}]';
COMMENT ON COLUMN public.submissions.videos IS 'Array of video objects: [{url, description, thumbnail_url, duration}]';
COMMENT ON COLUMN public.submissions.links IS 'Array of link objects: [{url, title, description, platform}]';
COMMENT ON COLUMN public.submissions.documents IS 'Array of document objects: [{url, filename, type, size}]';
COMMENT ON COLUMN public.submissions.attachments IS 'Legacy attachments field for backward compatibility';