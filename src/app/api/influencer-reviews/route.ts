import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'

type InfluencerReview = Database['public']['Tables']['influencer_reviews']['Row']
type InfluencerReviewInsert = Database['public']['Tables']['influencer_reviews']['Insert']
type InfluencerReviewUpdate = Database['public']['Tables']['influencer_reviews']['Update']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const influencerId = searchParams.get('influencerId')
    const businessId = searchParams.get('businessId')
    const campaignId = searchParams.get('campaignId')
    const isPublic = searchParams.get('isPublic')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('influencer_reviews')
      .select(`
        *,
        campaign:campaigns(
          id,
          title,
          budget
        ),
        business:profiles!business_id(
          id,
          business_profiles(
            company_name,
            logo_url
          )
        ),
        influencer:profiles!influencer_id(
          id,
          influencer_profiles(
            first_name,
            last_name,
            avatar_url,
            username
          )
        )
      `)

    // Apply filters
    if (influencerId) {
      query = query.eq('influencer_id', influencerId)
    }
    if (businessId) {
      query = query.eq('business_id', businessId)
    }
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    if (isPublic !== null) {
      query = query.eq('is_public', isPublic === 'true')
    }

    const { data: reviews, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error in reviews GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a business
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_role !== 'business') {
      return NextResponse.json({ error: 'Only businesses can create reviews' }, { status: 403 })
    }

    // Validate required fields
    const {
       campaign_id,
       influencer_id,
       application_id,
       overall_rating,
       title,
       review_text,
       communication_rating,
       content_quality_rating,
       professionalism_rating,
       timeliness_rating,
       would_work_again = false,
       is_public = true
     } = body

    if (!campaign_id || !influencer_id || !application_id || overall_rating === undefined || overall_rating === null) {
       return NextResponse.json({ 
         error: 'Missing required fields: campaign_id, influencer_id, application_id, overall_rating' 
       }, { status: 400 })
     }

    if (overall_rating < 1 || overall_rating > 5) {
       return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
     }

    // Verify the campaign belongs to the current user
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('business_id')
      .eq('id', campaign_id)
      .eq('business_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 })
    }

    // Verify the application exists and is approved
    const { data: application } = await supabase
      .from('applications')
      .select('status, influencer_id, campaign_id')
      .eq('id', application_id)
      .eq('campaign_id', campaign_id)
      .eq('influencer_id', influencer_id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'approved') {
      return NextResponse.json({ error: 'Can only review approved applications' }, { status: 400 })
    }

    // Check if review already exists
    const { data: existingReview, error: existingError } = await supabase
      .from('influencer_reviews')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('business_id', user.id)
      .eq('influencer_id', influencer_id)
      .single()

    if (existingReview && !existingError) {
      return NextResponse.json({ error: 'Review already exists for this campaign and influencer' }, { status: 409 })
    }

    const reviewData: InfluencerReviewInsert = {
      campaign_id,
       business_id: user.id,
       influencer_id,
       application_id,
       overall_rating,
       review_title: title,
       review_text,
       communication_rating,
       content_quality_rating,
       professionalism_rating,
       timeliness_rating,
       would_work_again,
       is_public
    }

    const { data: review, error } = await supabase
      .from('influencer_reviews')
      .insert(reviewData)
      .select(`
        *,
        campaign:campaigns(
          id,
          title,
          budget
        ),
        business:profiles!business_id(
          id,
          business_profiles(
            company_name,
            logo_url
          )
        ),
        influencer:profiles!influencer_id(
          id,
          influencer_profiles(
            first_name,
            last_name,
            avatar_url,
            username
          )
        )
      `)
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error in reviews POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
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

    // Get the review
    const { data: review } = await supabase
      .from('influencer_reviews')
      .select('business_id')
      .eq('id', reviewId)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check permissions
    const isBusiness = profile.user_role === 'business' && review.business_id === user.id
    const isAdmin = profile.user_role === 'admin'

    if (!isBusiness && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to update this review' }, { status: 403 })
    }

    // Prepare update data
    const updateData: InfluencerReviewUpdate = {}
    const {
      overall_rating,
      title,
      review_text,
      communication_rating,
      content_quality_rating,
      professionalism_rating,
      timeliness_rating,
      would_work_again,
      is_public,
      is_featured
    } = body

    if (isBusiness) {
      // Businesses can update their review content
      if (overall_rating !== undefined) {
        if (overall_rating < 1 || overall_rating > 5) {
          return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }
        updateData.overall_rating = overall_rating
      }
      if (title !== undefined) updateData.review_title = title
      if (review_text !== undefined) updateData.review_text = review_text
      if (communication_rating !== undefined) updateData.communication_rating = communication_rating
      if (content_quality_rating !== undefined) updateData.content_quality_rating = content_quality_rating
      if (professionalism_rating !== undefined) updateData.professionalism_rating = professionalism_rating
      if (timeliness_rating !== undefined) updateData.timeliness_rating = timeliness_rating
      if (would_work_again !== undefined) updateData.would_work_again = would_work_again
      if (is_public !== undefined) updateData.is_public = is_public
    }

    if (isAdmin) {
      // Admins can update featured status and visibility
      if (is_featured !== undefined) updateData.is_featured = is_featured
      if (is_public !== undefined) updateData.is_public = is_public
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof InfluencerReviewUpdate] === undefined) {
        delete updateData[key as keyof InfluencerReviewUpdate]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: updatedReview, error } = await supabase
      .from('influencer_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select(`
        *,
        campaign:campaigns(
          id,
          title,
          budget
        ),
        business:profiles!business_id(
          id,
          business_profiles(
            company_name,
            logo_url
          )
        ),
        influencer:profiles!influencer_id(
          id,
          influencer_profiles(
            first_name,
            last_name,
            avatar_url,
            username
          )
        )
      `)
      .single()

    if (error) {
      console.error('Error updating review:', error)
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }

    return NextResponse.json({ review: updatedReview })
  } catch (error) {
    console.error('Error in reviews PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
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

    // Get the review
    const { data: review } = await supabase
      .from('influencer_reviews')
      .select('business_id')
      .eq('id', reviewId)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check permissions
    const isBusiness = profile.user_role === 'business' && review.business_id === user.id
    const isAdmin = profile.user_role === 'admin'

    if (!isBusiness && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to delete this review' }, { status: 403 })
    }

    const { error } = await supabase
      .from('influencer_reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      console.error('Error deleting review:', error)
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error in reviews DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}