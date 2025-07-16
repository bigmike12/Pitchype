import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { createClient } from '@/lib/server'

type SocialMediaVerification = Database['public']['Tables']['social_media_verifications']['Row']
type SocialMediaVerificationInsert = Database['public']['Tables']['social_media_verifications']['Insert']

// Generate a random verification code
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url)
    
    const influencerId = searchParams.get('influencerId')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const isVerified = searchParams.get('isVerified')

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

    let query = supabase
      .from('social_media_verifications')
      .select(`
        *,
        influencer:profiles!influencer_id(
          id,
          user_role,
          influencer_profiles(
            first_name,
            last_name,
            avatar_url
          )
        ),
        reviewed_by_profile:profiles!reviewed_by(*)
      `)

    // Apply role-based filtering
    if (profile.user_role === 'influencer') {
      query = query.eq('influencer_id', user.id)
    } else if (profile.user_role === 'business') {
      // Businesses can only see verified accounts
      query = query.eq('is_verified', true)
    }
    // Admins can see all

    // Apply additional filters
    if (influencerId && profile.user_role === 'admin') {
      query = query.eq('influencer_id', influencerId)
    }
    if (platform) {
      query = query.eq('platform', platform)
    }
    if (status && profile.user_role !== 'business') {
      query = query.eq('status', status)
    }
    if (isVerified !== null && profile.user_role !== 'business') {
      query = query.eq('is_verified', isVerified === 'true')
    }

    const { data: verifications, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching social media verifications:', error)
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
    }

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('Error in social media verifications GET:', error)
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
      return NextResponse.json({ error: 'Only influencers can submit verification requests' }, { status: 403 })
    }

    // Validate required fields
    const {
      platform,
      username,
      profile_url,
      follower_count,
      verification_screenshot_url,
      verification_video_url
    } = body

    if (!platform || !username || !profile_url) {
      return NextResponse.json({ 
        error: 'Missing required fields: platform, username, profile_url' 
      }, { status: 400 })
    }

    // Validate platform
    const validPlatforms = ['instagram', 'youtube', 'tiktok', 'twitter']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ 
        error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ') 
      }, { status: 400 })
    }

    // Check if verification already exists for this platform
    const { data: existingVerification } = await supabase
      .from('social_media_verifications')
      .select('id, status')
      .eq('influencer_id', user.id)
      .eq('platform', platform)
      .single()

    if (existingVerification) {
      if (existingVerification.status === 'pending') {
        return NextResponse.json({ 
          error: 'A verification request for this platform is already pending' 
        }, { status: 409 })
      }
      if (existingVerification.status === 'approved') {
        return NextResponse.json({ 
          error: 'This platform is already verified' 
        }, { status: 409 })
      }
    }

    const verificationCode = generateVerificationCode()
    
    const verificationData: SocialMediaVerificationInsert = {
      influencer_id: user.id,
      platform,
      username,
      profile_url,
      follower_count: follower_count || 0,
      verification_screenshot_url,
      verification_video_url,
      verification_code: verificationCode,
      status: 'pending'
    }

    let query = supabase.from('social_media_verifications')

    if (existingVerification) {
      // Update existing verification
      const { data: verification, error } = await query
        .update(verificationData)
        .eq('id', existingVerification.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating social media verification:', error)
        return NextResponse.json({ error: 'Failed to update verification request' }, { status: 500 })
      }

      return NextResponse.json({ 
        verification, 
        message: 'Verification request updated successfully',
        verification_code: verificationCode
      })
    } else {
      // Create new verification
      const { data: verification, error } = await query
        .insert(verificationData)
        .select()
        .single()

      if (error) {
        console.error('Error creating social media verification:', error)
        return NextResponse.json({ error: 'Failed to create verification request' }, { status: 500 })
      }

      return NextResponse.json({ 
        verification, 
        message: 'Verification request submitted successfully',
        verification_code: verificationCode
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error in social media verifications POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const verificationId = searchParams.get('id')

    if (!verificationId) {
      return NextResponse.json({ error: 'Verification ID is required' }, { status: 400 })
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

    // Get the verification record
    const { data: verification } = await supabase
      .from('social_media_verifications')
      .select('*')
      .eq('id', verificationId)
      .single()

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    let updateData: any = {}

    if (profile.user_role === 'influencer' && verification.influencer_id === user.id) {
      // Influencers can only update their own pending verifications
      if (verification.status !== 'pending') {
        return NextResponse.json({ 
          error: 'Can only update pending verification requests' 
        }, { status: 403 })
      }

      const {
        username,
        profile_url,
        follower_count,
        verification_screenshot_url,
        verification_video_url
      } = body

      updateData = {
        username,
        profile_url,
        follower_count,
        verification_screenshot_url,
        verification_video_url
      }
    } else if (profile.user_role === 'admin') {
      // Admins can approve/reject verifications
      const { status, review_notes } = body

      if (!status || !['approved', 'rejected'].includes(status)) {
        return NextResponse.json({ 
          error: 'Status must be either approved or rejected' 
        }, { status: 400 })
      }

      updateData = {
        status,
        review_notes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      }

      if (status === 'approved') {
        updateData.is_verified = true
        updateData.verified_at = new Date().toISOString()
        // Set expiration to 1 year from now
        const expirationDate = new Date()
        expirationDate.setFullYear(expirationDate.getFullYear() + 1)
        updateData.verification_expires_at = expirationDate.toISOString()
      } else {
        updateData.is_verified = false
        updateData.verified_at = null
        updateData.verification_expires_at = null
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized to update this verification' }, { status: 403 })
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

    const { data: updatedVerification, error } = await supabase
      .from('social_media_verifications')
      .update(updateData)
      .eq('id', verificationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating social media verification:', error)
      return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 })
    }

    return NextResponse.json({ verification: updatedVerification })
  } catch (error) {
    console.error('Error in social media verifications PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url)
    const verificationId = searchParams.get('id')

    if (!verificationId) {
      return NextResponse.json({ error: 'Verification ID is required' }, { status: 400 })
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

    // Get the verification record
    const { data: verification } = await supabase
      .from('social_media_verifications')
      .select('influencer_id, status')
      .eq('id', verificationId)
      .single()

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    // Check permissions
    const canDelete = (
      (profile.user_role === 'influencer' && verification.influencer_id === user.id && verification.status === 'pending') ||
      profile.user_role === 'admin'
    )

    if (!canDelete) {
      return NextResponse.json({ error: 'Unauthorized to delete this verification' }, { status: 403 })
    }

    const { error } = await supabase
      .from('social_media_verifications')
      .delete()
      .eq('id', verificationId)

    if (error) {
      console.error('Error deleting social media verification:', error)
      return NextResponse.json({ error: 'Failed to delete verification' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Verification deleted successfully' })
  } catch (error) {
    console.error('Error in social media verifications DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}