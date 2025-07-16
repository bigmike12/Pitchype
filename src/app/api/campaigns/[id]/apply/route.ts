import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: campaignId } = await params;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to ensure they are an influencer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.user_role !== 'influencer') {
      return NextResponse.json({ error: 'Only influencers can apply to campaigns' }, { status: 403 });
    }

    // Check if campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'active') {
      return NextResponse.json({ error: 'Campaign is not accepting applications' }, { status: 400 });
    }

    // Check if user has already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('influencer_id', user.id)
      .single();

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this campaign' }, { status: 400 });
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        campaign_id: campaignId,
        influencer_id: user.id,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      application 
    });
  } catch (error) {
    console.error('Error in campaign apply route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}