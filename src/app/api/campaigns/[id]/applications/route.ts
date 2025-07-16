import { Database } from '@/types/database'
import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  
  try {
    const { id: campaignId } = await params
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify access to campaign
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('business_id, status')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check permissions
    if (profile.user_role === 'business') {
      const { data: business } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (!business || campaign.business_id !== business.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (profile.user_role === 'influencer') {
      // Influencers can only see their own applications
      const { data: influencer } = await supabase
        .from('influencer_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (!influencer) {
        return NextResponse.json({ error: 'Influencer profile not found' }, { status: 404 })
      }

      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          campaigns!applications_campaign_id_fkey (
            title,
            budget_min,
            budget_max
          )
        `)
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencer.id)

      if (error) {
        console.error('Error fetching applications:', error)
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
      }

      return NextResponse.json({ applications })
    }

    // For business owners, get all applications with influencer details
    // First get applications, then manually fetch influencer profiles
    const { data: applicationsData, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('submitted_at', { ascending: false })

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError)
      return NextResponse.json({ error: applicationsError.message }, { status: 500 })
    }

    // Get influencer profiles for each application
    const applications = await Promise.all(
      applicationsData.map(async (app) => {
        const { data: influencerProfile } = await supabase
          .from('influencer_profiles')
          .select('*')
          .eq('id', app.influencer_id)
          .single()
        
        return {
          ...app,
          influencer_profiles: influencerProfile
        }
      })
    )

    const error = null

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  
  try {
    const { id: campaignId } = await params
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is an influencer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_role !== 'influencer') {
      return NextResponse.json({ error: 'Only influencers can apply to campaigns' }, { status: 403 })
    }

    // Get influencer ID
    const { data: influencer } = await supabase
      .from('influencer_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer profile not found' }, { status: 404 })
    }

    // Verify campaign exists and is active
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('status, application_deadline, max_participants, selected_count')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'active') {
      return NextResponse.json({ error: 'Campaign is not accepting applications' }, { status: 400 })
    }

    if (campaign.application_deadline && new Date(campaign.application_deadline) < new Date()) {
      return NextResponse.json({ error: 'Application deadline has passed' }, { status: 400 })
    }

    if (campaign.max_participants && campaign.selected_count >= campaign.max_participants) {
      return NextResponse.json({ error: 'Campaign has reached maximum participants' }, { status: 400 })
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('influencer_id', influencer.id)
      .single()

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this campaign' }, { status: 400 })
    }

    const body = await request.json()
    const { proposal, proposed_rate, proposed_deliverables } = body

    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        campaign_id: campaignId,
        influencer_id: influencer.id,
        proposal,
        proposed_rate,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating application:', error)
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    // Update campaign application count
    await supabase
      .from('campaigns')
      .update({ 
        application_count: () => `application_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}