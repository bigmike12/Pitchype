import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';
import { notifyApplicationSubmitted } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const campaignId = searchParams.get('campaignId');
    const influencerId = searchParams.get('influencerId');
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('applications')
      .select(`
        *,
        campaign:campaigns!campaign_id(
          id,
          title,
          description,
          budget_min,
          budget_max,
          deliverables,
          requirements,
          status,
          business:profiles!campaigns_business_id_fkey(
            id,
            user_role,
            business_profiles(
              first_name,
              last_name,
              company_name,
              industry,
              website_url,
              avatar_url
            )
          )
        ),
        influencer:profiles!influencer_id(
          id,
          user_role,
          influencer_profiles(
            first_name,
            last_name,
            bio,
            instagram_handle,
            tiktok_handle,
            youtube_handle,
            follower_count,
            engagement_rate,
            avatar_url
          )
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (influencerId) {
      query = query.eq('influencer_id', influencerId);
    }

    if (businessId) {
      // Filter by business ID through campaigns
      query = query.eq('campaign.business_id', businessId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is an influencer
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.user_role !== 'influencer') {
      return NextResponse.json(
        { error: 'Only influencers can apply to campaigns' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      campaign_id,
      proposal,
      proposed_rate,
      estimated_reach,
      portfolio_links
    } = body;

    // Validate required fields
    if (!campaign_id || !proposal) {
      return NextResponse.json(
        { error: 'Campaign ID and proposal are required' },
        { status: 400 }
      );
    }

    // Check if campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, status, application_deadline')
      .eq('id', campaign_id)
      .single();

    if (campaignError) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign is not accepting applications' },
        { status: 400 }
      );
    }

    // Check if application deadline has passed
    if (campaign.application_deadline && new Date(campaign.application_deadline) < new Date()) {
      return NextResponse.json(
        { error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const { data: existingApplication, error: existingError } = await supabase
      .from('applications')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('influencer_id', user.id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this campaign' },
        { status: 400 }
      );
    }

    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        campaign_id,
        influencer_id: user.id,
        proposal,
        proposed_rate,
        estimated_reach,
        portfolio_links,
        status: 'pending'
      })
      .select(`
        *,
        campaign:campaigns(
          id,
          title,
          business:profiles!campaigns_business_id_fkey(
            id,
            business_profiles(
              first_name,
              last_name,
              company_name,
              industry,
              website_url,
              avatar_url
            )
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    // Send notification to the business owner
    try {
      const businessId = (application.campaign as any)?.business?.id;
      
      if (businessId) {
        // Get influencer's name for the notification
        const { data: influencerProfile } = await supabase
          .from('profiles')
          .select(`
            influencer_profiles(first_name, last_name)
          `)
          .eq('id', user.id)
          .single();
        
        const influencerName = influencerProfile?.influencer_profiles
          ? `${influencerProfile.influencer_profiles[0]?.first_name || ''} ${influencerProfile.influencer_profiles[0]?.last_name || ''}`.trim()
          : 'An influencer';
        
        await notifyApplicationSubmitted({
          businessUserId: businessId,
          influencerName,
          campaignTitle: (application.campaign as any)?.title || 'Your campaign',
          applicationId: application.id,
          campaignId: campaign_id
        });
      }
    } catch (notificationError) {
      console.error('Error sending application notification:', notificationError);
      // Don't fail the application creation if notification fails
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, status, reviewNotes } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Get the application to verify ownership/permissions
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select(`
        *,
        campaign:campaigns(
          business_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check permissions: influencer can update their own applications, business can update applications for their campaigns
    const userProfile = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    const isInfluencer = userProfile.data?.user_role === 'influencer' && application.influencer_id === user.id;
    const isBusiness = userProfile.data?.user_role === 'business' && (application.campaign as any)?.business_id === user.id;

    if (!isInfluencer && !isBusiness) {
      return NextResponse.json(
        { error: 'Unauthorized to update this application' },
        { status: 403 }
      );
    }

    // Update the application
    const updateData: any = {};
    if (status) updateData.status = status;
    if (reviewNotes) updateData.review_notes = reviewNotes;

    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select(`
        *,
        campaign:campaigns(
          id,
          title,
          business:profiles!campaigns_business_id_fkey(
            id,
            business_profiles(
              first_name,
              last_name,
              company_name
            )
          )
        ),
        influencer:profiles!applications_influencer_id_fkey(
          id,
          influencer_profiles(
            first_name,
            last_name
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}