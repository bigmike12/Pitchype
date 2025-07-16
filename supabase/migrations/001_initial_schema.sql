-- Enable Row Level Security

-- Create custom types
CREATE TYPE user_role AS ENUM ('business', 'influencer', 'admin');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Base users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_role user_role NOT NULL DEFAULT 'influencer',
  email TEXT,
  profile_visibility TEXT DEFAULT 'public',
  account_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Influencer profiles table
CREATE TABLE public.influencer_profiles (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  instagram_handle TEXT,
  youtube_handle TEXT,
  tiktok_handle TEXT,
  twitter_handle TEXT,
  follower_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  categories TEXT[],
  languages TEXT[],
  rate_per_post DECIMAL(10,2),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE public.business_profiles (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT NOT NULL,
  company_description TEXT,
  industry TEXT,
  website_url TEXT,
  address TEXT,
  location TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  deliverables TEXT[],
  target_audience TEXT,
  campaign_goals TEXT[],
  start_date DATE,
  end_date DATE,
  application_deadline DATE,
  status campaign_status DEFAULT 'draft',
  tags TEXT[],
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES public.influencer_profiles(id) ON DELETE CASCADE NOT NULL,
  proposal TEXT,
  proposed_rate DECIMAL(10,2),
  estimated_reach INTEGER,
  portfolio_links TEXT[],
  status application_status DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  message_type message_type DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for influencer_profiles table
CREATE POLICY "Influencers can view their own profile" ON public.influencer_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view influencer profiles" ON public.influencer_profiles
  FOR SELECT USING (true);

CREATE POLICY "Influencers can update their own profile" ON public.influencer_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Influencers can insert their own profile" ON public.influencer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for business_profiles table
CREATE POLICY "Businesses can view their own profile" ON public.business_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view business profiles" ON public.business_profiles
  FOR SELECT USING (true);

CREATE POLICY "Businesses can update their own profile" ON public.business_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Businesses can insert their own profile" ON public.business_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for campaigns table
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (status = 'active');

CREATE POLICY "Business users can view their own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = business_id);

CREATE POLICY "Business users can create campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Business users can update their own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = business_id);

CREATE POLICY "Business users can delete their own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = business_id);

-- RLS Policies for applications table
CREATE POLICY "Users can view applications they're involved in" ON public.applications
  FOR SELECT USING (
    auth.uid() = influencer_id OR 
    auth.uid() IN (SELECT business_id FROM public.campaigns WHERE id = campaign_id)
  );

CREATE POLICY "Influencers can create applications" ON public.applications
  FOR INSERT WITH CHECK (
    auth.uid() = influencer_id AND
    EXISTS (SELECT 1 FROM public.influencer_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update applications they're involved in" ON public.applications
  FOR UPDATE USING (
    auth.uid() = influencer_id OR 
    auth.uid() IN (SELECT business_id FROM public.campaigns WHERE id = campaign_id)
  );

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in their applications" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() IN (
      SELECT influencer_id FROM public.applications WHERE id = application_id
      UNION
      SELECT business_id FROM public.campaigns c 
      JOIN public.applications a ON c.id = a.campaign_id 
      WHERE a.id = application_id
    )
  );

CREATE POLICY "Users can send messages in their applications" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT influencer_id FROM public.applications WHERE id = application_id
      UNION
      SELECT business_id FROM public.campaigns c 
      JOIN public.applications a ON c.id = a.campaign_id 
      WHERE a.id = application_id
    )
  );

-- RLS Policies for payments table
CREATE POLICY "Users can view payments for their applications" ON public.payments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT influencer_id FROM public.applications WHERE id = application_id
      UNION
      SELECT business_id FROM public.campaigns c 
      JOIN public.applications a ON c.id = a.campaign_id 
      WHERE a.id = application_id
    )
  );

CREATE POLICY "Business users can create payments" ON public.payments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT business_id FROM public.campaigns c 
      JOIN public.applications a ON c.id = a.campaign_id 
      WHERE a.id = application_id
    )
  );

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get user type from metadata, default to 'influencer'
  user_role_val := COALESCE(NEW.raw_user_meta_data->>'user_role', 'influencer')::user_role;
  
  -- Insert into base users table
  INSERT INTO public.users (id, user_role, email, created_at, updated_at)
  VALUES (
    NEW.id,
    user_role_val,
    NEW.email,
    NOW(),
    NOW()
  );
  
  -- Insert into appropriate profile table based on user type
  IF user_role_val = 'influencer' THEN
    INSERT INTO public.influencer_profiles (id, first_name, last_name, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NOW(),
      NOW()
    );
  ELSIF user_role_val = 'business' THEN
    INSERT INTO public.business_profiles (id, first_name, last_name, company_name, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unnamed Company'),
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
-- Base users table indexes
CREATE INDEX idx_users_user_role ON public.users(user_role);
CREATE INDEX idx_users_email ON public.users(email);

-- Influencer profiles indexes
CREATE INDEX idx_influencer_profiles_verified ON public.influencer_profiles(is_verified);
CREATE INDEX idx_influencer_profiles_location ON public.influencer_profiles(location);
CREATE INDEX idx_influencer_profiles_categories ON public.influencer_profiles USING GIN(categories);
CREATE INDEX idx_influencer_profiles_languages ON public.influencer_profiles USING GIN(languages);

-- Business profiles indexes
CREATE INDEX idx_business_profiles_verified ON public.business_profiles(is_verified);
CREATE INDEX idx_business_profiles_industry ON public.business_profiles(industry);
CREATE INDEX idx_business_profiles_location ON public.business_profiles(location);

-- Campaigns indexes
CREATE INDEX idx_campaigns_business_id ON public.campaigns(business_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_start_date ON public.campaigns(start_date);
CREATE INDEX idx_campaigns_end_date ON public.campaigns(end_date);
CREATE INDEX idx_campaigns_tags ON public.campaigns USING GIN(tags);

-- Applications indexes
CREATE INDEX idx_applications_campaign_id ON public.applications(campaign_id);
CREATE INDEX idx_applications_influencer_id ON public.applications(influencer_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_submitted_at ON public.applications(submitted_at);

-- Messages indexes
CREATE INDEX idx_messages_application_id ON public.messages(application_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

-- Payments indexes
CREATE INDEX idx_payments_application_id ON public.payments(application_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);