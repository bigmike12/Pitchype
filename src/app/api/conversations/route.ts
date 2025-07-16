import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    let conversationsQuery;

    if (profile.user_role === 'influencer') {
      // For influencers, get applications they've made
      conversationsQuery = supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          campaign:campaigns(
            id,
            title,
            status,
            business:profiles!campaigns_business_id_fkey(
              id,
              email,
              business_profiles(
                first_name,
                last_name,
                company_name,
                avatar_url
              )
            )
          ),
          messages(
            id,
            content,
            created_at,
            sender_id,
            is_read
          )
        `)
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    } else {
      // For businesses, get applications for their campaigns
      conversationsQuery = supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          influencer:profiles!applications_influencer_id_fkey(
            id,
            email,
            user_role,
            influencer_profiles(
              first_name,
              last_name,
              bio,
              avatar_url
            )
          ),
          campaign:campaigns(
            id,
            title,
            status
          ),
          messages(
            id,
            content,
            created_at,
            sender_id,
            is_read
          )
        `)
        .eq('campaigns.business_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    }

    const { data: applications, error } = await conversationsQuery;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Transform applications into conversations format
    const conversations = applications?.map((app: any) => {
      const messages = app.messages || [];
      const lastMessage = messages.length > 0 
        ? messages.reduce((latest: any, current: any) => 
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest
          )
        : null;
      
      const unreadCount = messages.filter((msg: any) => 
        !msg.is_read && msg.sender_id !== user.id
      ).length;

      let participant;
      if (profile.user_role === 'influencer') {
        // For influencers, participant is the business
        const business = app.campaign?.business;
        const businessProfile = business?.business_profiles;
        participant = {
          id: business?.id,
          name: businessProfile ? `${businessProfile.first_name || ''} ${businessProfile.last_name || ''}`.trim() : business?.email || 'Unknown',
          avatar: businessProfile?.avatar_url,
          company: businessProfile?.company_name,
          role: 'business' as const,
          isOnline: false // We don't track online status yet
        };
      } else {
        // For businesses, participant is the influencer
        const influencer = app.influencer;
        const influencerProfile = influencer?.influencer_profiles;
        participant = {
          id: influencer?.id,
          name: influencerProfile ? `${influencerProfile.first_name || ''} ${influencerProfile.last_name || ''}`.trim() : influencer?.email || 'Unknown',
          avatar: influencerProfile?.avatar_url,
          bio: influencerProfile?.bio,
          role: 'influencer' as const,
          isOnline: false // We don't track online status yet
        };
      }

      return {
        id: app.id,
        participant,
        campaign: app.campaign ? {
          id: app.campaign.id,
          title: app.campaign.title,
          status: app.campaign.status
        } : null,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          timestamp: lastMessage.created_at,
          senderId: lastMessage.sender_id
        } : null,
        unreadCount,
        isStarred: false, // We don't have starred conversations yet
        isArchived: false, // We don't have archived conversations yet
        applicationStatus: app.status,
        createdAt: app.created_at
      };
    }) || [];

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}