import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'
import { createClient } from '@/lib/server'

type BankDetails = Database['public']['Tables']['influencer_bank_details']['Row']
type BankDetailsInsert = Database['public']['Tables']['influencer_bank_details']['Insert']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url)
    
    const influencerId = searchParams.get('influencerId')
    const isActive = searchParams.get('isActive')
    const isPrimary = searchParams.get('isPrimary')

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
      .from('influencer_bank_details')
      .select('*')

    // Apply role-based filtering
    if (profile.user_role === 'influencer') {
      query = query.eq('influencer_id', user.id)
    } else if (profile.user_role === 'admin' && influencerId) {
      query = query.eq('influencer_id', influencerId)
    } else if (profile.user_role === 'business') {
      return NextResponse.json({ error: 'Businesses cannot access bank details' }, { status: 403 })
    }

    // Apply additional filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    if (isPrimary !== null) {
      query = query.eq('is_primary', isPrimary === 'true')
    }

    const { data: bankDetails, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bank details:', error)
      return NextResponse.json({ error: 'Failed to fetch bank details' }, { status: 500 })
    }

    // Mask sensitive information for non-admin users
    if (profile.user_role !== 'admin') {
      const maskedBankDetails = bankDetails?.map(detail => ({
        ...detail,
        account_number: detail.account_number.replace(/.(?=.{4})/g, '*'),
        routing_number: detail.routing_number ? detail.routing_number.replace(/.(?=.{4})/g, '*') : null
      }))
      return NextResponse.json({ bankDetails: maskedBankDetails })
    }

    return NextResponse.json({ bankDetails })
  } catch (error) {
    console.error('Error in bank details GET:', error)
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
      return NextResponse.json({ error: 'Only influencers can add bank details' }, { status: 403 })
    }

    // Validate required fields
    const {
      bank_name,
      account_name,
      account_holder_name,
      account_number,
      routing_number,
      swift_code,
      bank_address,
      account_holder_address,
      currency,
      account_type,
      is_primary
    } = body

    // Use account_holder_name if provided, otherwise use account_name (for backward compatibility)
    const finalAccountHolderName = account_holder_name || account_name

    if (!bank_name || !finalAccountHolderName || !account_number) {
      return NextResponse.json({ 
        error: 'Missing required fields: bank_name, account_holder_name, account_number' 
      }, { status: 400 })
    }

    // Validate account type
    const validAccountTypes = ['checking', 'savings', 'business']
    if (account_type && !validAccountTypes.includes(account_type)) {
      return NextResponse.json({ 
        error: 'Invalid account type. Must be one of: ' + validAccountTypes.join(', ') 
      }, { status: 400 })
    }

    // If this is set as primary, unset other primary accounts
    if (is_primary) {
      await supabase
        .from('influencer_bank_details')
        .update({ is_primary: false })
        .eq('influencer_id', user.id)
        .eq('is_primary', true)
    }

    // Check if this is the first bank account (auto-set as primary)
    const { data: existingAccounts } = await supabase
      .from('influencer_bank_details')
      .select('id')
      .eq('influencer_id', user.id)
      .eq('is_active', true)

    const shouldBePrimary = is_primary || !existingAccounts || existingAccounts.length === 0

    const bankDetailsData: BankDetailsInsert = {
      influencer_id: user.id,
      bank_name,
      account_name: finalAccountHolderName,
      account_holder_name: finalAccountHolderName,
      account_number,
      routing_number,
      swift_code,
      bank_address,
      account_holder_address,
      currency: currency || 'USD',
      account_type: account_type || 'checking',
      is_primary: shouldBePrimary,
      is_active: true,
      is_verified: false
    }

    const { data: bankDetails, error } = await supabase
      .from('influencer_bank_details')
      .insert(bankDetailsData)
      .select()
      .single()

    if (error) {
      console.error('Error creating bank details:', error)
      return NextResponse.json({ error: 'Failed to create bank details' }, { status: 500 })
    }

    // Mask sensitive information in response
    const maskedBankDetails = {
      ...bankDetails,
      account_number: bankDetails.account_number.replace(/.(?=.{4})/g, '*'),
      routing_number: bankDetails.routing_number ? bankDetails.routing_number.replace(/.(?=.{4})/g, '*') : null
    }

    return NextResponse.json({ 
      bankDetails: maskedBankDetails,
      message: 'Bank details added successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error in bank details POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const bankDetailsId = searchParams.get('id')

    if (!bankDetailsId) {
      return NextResponse.json({ error: 'Bank details ID is required' }, { status: 400 })
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

    // Get the bank details record
    const { data: bankDetails } = await supabase
      .from('influencer_bank_details')
      .select('*')
      .eq('id', bankDetailsId)
      .single()

    if (!bankDetails) {
      return NextResponse.json({ error: 'Bank details not found' }, { status: 404 })
    }

    // Check permissions
    const canUpdate = (
      (profile.user_role === 'influencer' && bankDetails.influencer_id === user.id) ||
      profile.user_role === 'admin'
    )

    if (!canUpdate) {
      return NextResponse.json({ error: 'Unauthorized to update these bank details' }, { status: 403 })
    }

    let updateData: any = {}

    if (profile.user_role === 'influencer') {
      // Influencers can update their own bank details
      const {
        bank_name,
        account_name,
        account_holder_name,
        account_number,
        routing_number,
        swift_code,
        bank_address,
        account_holder_address,
        currency,
        account_type,
        is_primary,
        is_active
      } = body

      // Use account_holder_name if provided, otherwise use account_name (for backward compatibility)
      const finalAccountHolderName = account_holder_name || account_name

      updateData = {
        bank_name,
        account_name: finalAccountHolderName,
        account_holder_name: finalAccountHolderName,
        account_number,
        routing_number,
        swift_code,
        bank_address,
        account_holder_address,
        currency,
        account_type,
        is_primary,
        is_active
      }

      // If setting as primary, unset other primary accounts
      if (is_primary && !bankDetails.is_primary) {
        await supabase
          .from('influencer_bank_details')
          .update({ is_primary: false })
          .eq('influencer_id', user.id)
          .eq('is_primary', true)
          .neq('id', bankDetailsId)
      }
    } else if (profile.user_role === 'admin') {
      // Admins can verify bank details
      const { is_verified, verification_method } = body

      updateData = {
        is_verified,
        verification_method,
        verified_at: is_verified ? new Date().toISOString() : null
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

    const { data: updatedBankDetails, error } = await supabase
      .from('influencer_bank_details')
      .update(updateData)
      .eq('id', bankDetailsId)
      .select()
      .single()

    if (error) {
      console.error('Error updating bank details:', error)
      return NextResponse.json({ error: 'Failed to update bank details' }, { status: 500 })
    }

    // Mask sensitive information in response for non-admin users
    let responseBankDetails = updatedBankDetails
    if (profile.user_role !== 'admin') {
      responseBankDetails = {
        ...updatedBankDetails,
        account_number: updatedBankDetails.account_number.replace(/.(?=.{4})/g, '*'),
        routing_number: updatedBankDetails.routing_number ? updatedBankDetails.routing_number.replace(/.(?=.{4})/g, '*') : null
      }
    }

    return NextResponse.json({ bankDetails: responseBankDetails })
  } catch (error) {
    console.error('Error in bank details PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url)
    const bankDetailsId = searchParams.get('id')

    if (!bankDetailsId) {
      return NextResponse.json({ error: 'Bank details ID is required' }, { status: 400 })
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

    // Get the bank details record
    const { data: bankDetails } = await supabase
      .from('influencer_bank_details')
      .select('influencer_id, is_primary')
      .eq('id', bankDetailsId)
      .single()

    if (!bankDetails) {
      return NextResponse.json({ error: 'Bank details not found' }, { status: 404 })
    }

    // Check permissions
    const canDelete = (
      (profile.user_role === 'influencer' && bankDetails.influencer_id === user.id) ||
      profile.user_role === 'admin'
    )

    if (!canDelete) {
      return NextResponse.json({ error: 'Unauthorized to delete these bank details' }, { status: 403 })
    }

    // If deleting primary account, set another account as primary
    if (bankDetails.is_primary) {
      const { data: otherAccounts } = await supabase
        .from('influencer_bank_details')
        .select('id')
        .eq('influencer_id', bankDetails.influencer_id)
        .eq('is_active', true)
        .neq('id', bankDetailsId)
        .limit(1)

      if (otherAccounts && otherAccounts.length > 0) {
        await supabase
          .from('influencer_bank_details')
          .update({ is_primary: true })
          .eq('id', otherAccounts[0].id)
      }
    }

    const { error } = await supabase
      .from('influencer_bank_details')
      .delete()
      .eq('id', bankDetailsId)

    if (error) {
      console.error('Error deleting bank details:', error)
      return NextResponse.json({ error: 'Failed to delete bank details' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Bank details deleted successfully' })
  } catch (error) {
    console.error('Error in bank details DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}