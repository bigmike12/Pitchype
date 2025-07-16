-- Add payment and escrow system for campaign lifecycle

-- Update existing enums to support new statuses
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'in_escrow';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'refunded';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'completed';

-- Create escrow_accounts table
CREATE TABLE public.escrow_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  held_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  auto_release_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, payment_id)
);

-- Create influencer_balances table
CREATE TABLE public.influencer_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  available_balance DECIMAL(10,2) DEFAULT 0.00,
  pending_balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'NGN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(influencer_id)
);

-- Create payout_requests table
CREATE TABLE public.payout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_method JSONB,
  paystack_transfer_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_settings table for admin configuration
CREATE TABLE public.platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update payments table to support Paystack and transaction fees
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
ADD COLUMN IF NOT EXISTS transaction_fee DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'paystack',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update currency default to NGN
ALTER TABLE public.payments ALTER COLUMN currency SET DEFAULT 'NGN';

-- Add submission tracking to applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS work_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submission_notes TEXT,
ADD COLUMN IF NOT EXISTS submission_attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS auto_approve_date TIMESTAMP WITH TIME ZONE;

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description) VALUES
('platform_fee_percentage', '10', 'Platform fee percentage charged on payouts (default: 10%)'),
('transaction_fee_percentage', '5', 'Transaction fee percentage charged on payments (default: 5%)'),
('transaction_fee_cap', '2000', 'Maximum transaction fee in NGN (default: ₦2,000)'),
('auto_release_days', '7', 'Days after submission before auto-release of escrow (default: 7 days)'),
('currency', '"NGN"', 'Platform default currency')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escrow_accounts
CREATE POLICY "Users can view escrow for their applications" ON public.escrow_accounts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT influencer_id FROM public.applications WHERE id = application_id
      UNION
      SELECT business_id FROM public.campaigns c 
      JOIN public.applications a ON c.id = a.campaign_id 
      WHERE a.id = application_id
    )
  );

CREATE POLICY "System can manage escrow accounts" ON public.escrow_accounts
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for influencer_balances
CREATE POLICY "Influencers can view their own balance" ON public.influencer_balances
  FOR SELECT USING (auth.uid() = influencer_id);

CREATE POLICY "System can update influencer balances" ON public.influencer_balances
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for payout_requests
CREATE POLICY "Influencers can view their payout requests" ON public.payout_requests
  FOR SELECT USING (auth.uid() = influencer_id);

CREATE POLICY "Influencers can create payout requests" ON public.payout_requests
  FOR INSERT WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Admins can manage payout requests" ON public.payout_requests
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_role = 'admin'
    )
  );

-- RLS Policies for platform_settings
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view platform settings" ON public.platform_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_escrow_accounts_application_id ON public.escrow_accounts(application_id);
CREATE INDEX idx_escrow_accounts_status ON public.escrow_accounts(status);
CREATE INDEX idx_escrow_accounts_auto_release_date ON public.escrow_accounts(auto_release_date);
CREATE INDEX idx_influencer_balances_influencer_id ON public.influencer_balances(influencer_id);
CREATE INDEX idx_payout_requests_influencer_id ON public.payout_requests(influencer_id);
CREATE INDEX idx_payout_requests_status ON public.payout_requests(status);
CREATE INDEX idx_platform_settings_key ON public.platform_settings(setting_key);

-- Add triggers for updated_at
CREATE TRIGGER update_escrow_accounts_updated_at
  BEFORE UPDATE ON public.escrow_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_balances_updated_at
  BEFORE UPDATE ON public.influencer_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_requests_updated_at
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-release escrow after deadline
CREATE OR REPLACE FUNCTION auto_release_expired_escrow()
RETURNS void AS $$
BEGIN
  -- Update applications to completed and release escrow for expired submissions
  UPDATE public.applications 
  SET status = 'completed', updated_at = NOW()
  WHERE status = 'submitted' 
    AND auto_approve_date <= NOW()
    AND id IN (
      SELECT application_id FROM public.escrow_accounts 
      WHERE status = 'held'
    );
  
  -- Release escrow funds
  UPDATE public.escrow_accounts 
  SET status = 'released', released_at = NOW(), updated_at = NOW()
  WHERE status = 'held' 
    AND auto_release_date <= NOW();
  
  -- Update influencer balances
  INSERT INTO public.influencer_balances (influencer_id, available_balance, total_earned)
  SELECT 
    a.influencer_id,
    COALESCE(SUM(e.amount), 0),
    COALESCE(SUM(e.amount), 0)
  FROM public.escrow_accounts e
  JOIN public.applications a ON e.application_id = a.id
  WHERE e.status = 'released' 
    AND e.released_at >= NOW() - INTERVAL '1 minute'
  GROUP BY a.influencer_id
  ON CONFLICT (influencer_id) 
  DO UPDATE SET 
    available_balance = influencer_balances.available_balance + EXCLUDED.available_balance,
    total_earned = influencer_balances.total_earned + EXCLUDED.total_earned,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMIT;