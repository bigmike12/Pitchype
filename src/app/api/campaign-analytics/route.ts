import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { createClient } from '@/lib/server'

type CampaignAnalytics = Database['public']['Tables']['campaign_analytics']['Row']
type CampaignAnalyticsInsert = Database['public']['Tables']['campaign_analytics']['Insert']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url)
    
    const applicationId = searchParams.get('applicationId')
    const campaignId = searchParams.get('campaignId')
    const influencerId = searchParams.get('influencerId')
    const platform = searchParams.get('platform')
    const verificationStatus = searchParams.get('verificationStatus')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('campaign_analytics')
      .select(`
        *,
        application:applications(*),
        campaign:campaigns(*),
        influencer:profiles!influencer_id(
          id,
          user_role,
          influencer_profiles(
            first_name,
            last_name,
            avatar_url
          )
        ),
        verified_by_profile:profiles!verified_by(*)
      `)

    // Apply filters
    if (applicationId) {
      query = query.eq('application_id', applicationId)
    }
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    if (influencerId) {
      query = query.eq('influencer_id', influencerId)
    }
    if (platform) {
      query = query.eq('platform', platform)
    }
    if (verificationStatus) {
      query = query.eq('verification_status', verificationStatus)
    }

    const { data: analytics, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaign analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Error in campaign analytics GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is an influencer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_role !== 'influencer') {
      return NextResponse.json({ error: 'Only influencers can submit analytics' }, { status: 403 })
    }

    // Validate required fields
    const {
      application_id,
      campaign_id,
      platform,
      post_url,
      post_type,
      views_count,
      likes_count,
      comments_count,
      shares_count,
      saves_count,
      reach_count,
      impressions_count,
      engagement_rate,
      click_through_rate,
      screenshot_urls,
      additional_notes
    } = body

    if (!application_id || !campaign_id || !platform || !post_url || !post_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: application_id, campaign_id, platform, post_url, post_type' 
      }, { status: 400 })
    }

    // Verify the application belongs to the current user
    const { data: application } = await supabase
      .from('applications')
      .select('influencer_id, campaign_id')
      .eq('id', application_id)
      .eq('influencer_id', user.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found or unauthorized' }, { status: 404 })
    }

    if (application.campaign_id !== campaign_id) {
      return NextResponse.json({ error: 'Campaign ID mismatch' }, { status: 400 })
    }

    const analyticsData: CampaignAnalyticsInsert = {
      application_id,
      influencer_id: user.id,
      campaign_id,
      platform,
      post_url,
      post_type,
      views_count: views_count || 0,
      likes_count: likes_count || 0,
      comments_count: comments_count || 0,
      shares_count: shares_count || 0,
      saves_count: saves_count || 0,
      reach_count: reach_count || 0,
      impressions_count: impressions_count || 0,
      engagement_rate: engagement_rate || 0,
      click_through_rate: click_through_rate || 0,
      screenshot_urls: screenshot_urls || [],
      additional_notes,
      verification_status: 'pending'
    }

    const { data: analytics, error } = await supabase
      .from('campaign_analytics')
      .insert(analyticsData)
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign analytics:', error)
      return NextResponse.json({ error: 'Failed to create analytics' }, { status: 500 })
    }

    return NextResponse.json({ analytics }, { status: 201 })
  } catch (error) {
    console.error('Error in campaign analytics POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const analyticsId = searchParams.get('id')

    if (!analyticsId) {
      return NextResponse.json({ error: 'Analytics ID is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get the analytics record
    const { data: analytics } = await supabase
      .from('campaign_analytics')
      .select('*, campaign:campaigns(business_id)')
      .eq('id', analyticsId)
      .single()

    if (!analytics) {
      return NextResponse.json({ error: 'Analytics not found' }, { status: 404 })
    }

    // Check permissions
    const isInfluencer = profile.user_role === 'influencer' && analytics.influencer_id === user.id
    const isBusiness = profile.user_role === 'business' && analytics.campaign?.business_id === user.id
    const isAdmin = profile.user_role === 'admin'

    if (!isInfluencer && !isBusiness && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to update this analytics' }, { status: 403 })
    }

    // Prepare update data based on user role
    let updateData: any = {}

    if (isInfluencer && analytics.verification_status === 'pending') {
      // Influencers can only update their own pending analytics
      const {
        platform,
        post_url,
        post_type,
        views_count,
        likes_count,
        comments_count,
        shares_count,
        saves_count,
        reach_count,
        impressions_count,
        engagement_rate,
        click_through_rate,
        screenshot_urls,
        additional_notes
      } = body

      updateData = {
        platform,
        post_url,
        post_type,
        views_count,
        likes_count,
        comments_count,
        shares_count,
        saves_count,
        reach_count,
        impressions_count,
        engagement_rate,
        click_through_rate,
        screenshot_urls,
        additional_notes
      }
    } else if (isBusiness || isAdmin) {
      // Businesses and admins can verify analytics
      const { verification_status, verification_notes } = body

      if (verification_status && ['verified', 'rejected', 'disputed'].includes(verification_status)) {
        updateData = {
          verification_status,
          verification_notes,
          verified_by: user.id,
          verified_at: new Date().toISOString()
        }
      }
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: updatedAnalytics, error } = await supabase
      .from('campaign_analytics')
      .update(updateData)
      .eq('id', analyticsId)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign analytics:', error)
      return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
    }

    return NextResponse.json({ analytics: updatedAnalytics })
  } catch (error) {
    console.error('Error in campaign analytics PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}