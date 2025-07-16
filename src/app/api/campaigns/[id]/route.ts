import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
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
        ),
        applications:applications(
          id,
          status,
          proposal,
          proposed_rate,
          estimated_reach,
          submitted_at,
          influencer:profiles!applications_influencer_id_fkey(
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
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching campaign:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns this campaign
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('business_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    if (existingCampaign.business_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own campaigns' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      requirements,
      budget_min,
      budget_max,
      deliverables,
      target_audience,
      campaign_goals,
      platforms,
      guidelines,
      start_date,
      end_date,
      application_deadline,
      status,
      tags,
      images
    } = body;

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        title,
        description,
        requirements,
        budget_min,
        budget_max,
        deliverables,
        target_audience,
        campaign_goals,
        platforms,
        guidelines,
        start_date,
        end_date,
        application_deadline,
        status,
        tags,
        images
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns this campaign
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('business_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    if (existingCampaign.business_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own campaigns' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      requirements,
      budget_min,
      budget_max,
      minimum_followers,
      deliverables,
      target_audience,
      campaign_goals,
      platforms,
      start_date,
      end_date,
      required_influencers,
      status,
      tags,
      guidelines
    } = body;

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        title,
        description,
        requirements,
        budget_min,
        budget_max,
        minimum_followers,
        deliverables,
        target_audience,
        campaign_goals,
        platforms,
        start_date,
        end_date,
        required_influencers,
        status,
        tags,
        guidelines
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns this campaign
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('business_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    if (existingCampaign.business_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own campaigns' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}