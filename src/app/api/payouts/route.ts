import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

type PayoutRequest = Database['public']['Tables']['payout_requests']['Row'];
type PayoutInsert = Database['public']['Tables']['payout_requests']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is an influencer
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.user_role !== 'influencer') {
      return NextResponse.json({ error: 'Only influencers can request payouts' }, { status: 403 });
    }

    const body = await request.json();
    const { amount, paymentMethod } = body;

    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Amount and payment method are required' },
        { status: 400 }
      );
    }

    // Get influencer balance
    const { data: balance, error: balanceError } = await supabase
      .from('influencer_balances')
      .select('*')
      .eq('influencer_id', user.id)
      .single();

    if (balanceError || !balance) {
      return NextResponse.json({ error: 'No balance found' }, { status: 404 });
    }

    // Check if requested amount is available
    if (amount > balance.available_balance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Get platform fee percentage from settings
    const { data: platformSettings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'platform_fee_percentage')
      .single();

    const platformFeePercentage = settingsError ? 10 : parseInt(platformSettings.setting_value);
    const platformFee = (amount * platformFeePercentage) / 100;
    const netAmount = amount - platformFee;

    // Create payout request
    const { data: payoutRequest, error: payoutError } = await supabase
      .from('payout_requests')
      .insert({
        influencer_id: user.id,
        amount: amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        currency: 'NGN',
        status: 'pending',
        payment_method: paymentMethod
      } as PayoutInsert)
      .select(`
        *,
        influencer:profiles!payout_requests_influencer_id_fkey(
          id,
          user_role,
          influencer_profiles!inner(
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .single();

    if (payoutError) {
      console.error('Payout request creation error:', payoutError);
      return NextResponse.json({ error: 'Failed to create payout request' }, { status: 500 });
    }

    // Update influencer balance (move from available to pending)
    const { error: balanceUpdateError } = await supabase
      .from('influencer_balances')
      .update({
        available_balance: balance.available_balance - amount,
        pending_balance: balance.pending_balance + amount
      })
      .eq('influencer_id', user.id);

    if (balanceUpdateError) {
      console.error('Balance update error:', balanceUpdateError);
      // Rollback payout request
      await supabase
        .from('payout_requests')
        .delete()
        .eq('id', payoutRequest.id);
      
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      payoutRequest,
      message: 'Payout request created successfully'
    });

  } catch (error) {
    console.error('Payout request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const influencerId = searchParams.get('influencerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Check user role
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 });
    }

    let query = supabase
      .from('payout_requests')
      .select(`
        *,
        influencer:profiles!payout_requests_influencer_id_fkey(
          id,
          user_role,
          influencer_profiles!inner(
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Filter based on user role and permissions
    if (userProfile.user_role === 'influencer') {
      query = query.eq('influencer_id', user.id);
    } else if (userProfile.user_role === 'admin') {
      // Admin can see all payout requests
      if (influencerId) {
        query = query.eq('influencer_id', influencerId);
      }
    } else {
      // Business users cannot access payout requests
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: payoutRequests, error } = await query;

    if (error) {
      console.error('Payout requests fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch payout requests' }, { status: 500 });
    }

    return NextResponse.json({ payoutRequests });

  } catch (error) {
    console.error('Payout requests GET error:', error);
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

    // Verify user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update payout requests' }, { status: 403 });
    }

    const body = await request.json();
    const { payoutRequestId, status, paystackTransferId } = body;

    if (!payoutRequestId || !status) {
      return NextResponse.json(
        { error: 'Payout request ID and status are required' },
        { status: 400 }
      );
    }

    // Get the payout request
    const { data: payoutRequest, error: fetchError } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('id', payoutRequestId)
      .single();

    if (fetchError || !payoutRequest) {
      return NextResponse.json({ error: 'Payout request not found' }, { status: 404 });
    }

    // Update payout request
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString();
      if (paystackTransferId) {
        updateData.paystack_transfer_id = paystackTransferId;
      }
    }

    const { data: updatedPayout, error: updateError } = await supabase
      .from('payout_requests')
      .update(updateData)
      .eq('id', payoutRequestId)
      .select()
      .single();

    if (updateError) {
      console.error('Payout update error:', updateError);
      return NextResponse.json({ error: 'Failed to update payout request' }, { status: 500 });
    }

    // Update influencer balance based on status
    if (status === 'completed') {
      // Remove from pending balance
      const { error: balanceError } = await supabase
        .from('influencer_balances')
        .update({
          pending_balance: supabase.rpc('greatest', [0, payoutRequest.amount * -1])
        })
        .eq('influencer_id', payoutRequest.influencer_id);

      if (balanceError) {
        console.error('Balance update error:', balanceError);
      }
    } else if (status === 'failed' || status === 'cancelled') {
      // Return amount to available balance
      const { error: balanceError } = await supabase
        .rpc('update_influencer_balance_on_payout_failure', {
          influencer_id: payoutRequest.influencer_id,
          amount: payoutRequest.amount
        });

      if (balanceError) {
        console.error('Balance restoration error:', balanceError);
      }
    }

    return NextResponse.json({
      success: true,
      payoutRequest: updatedPayout,
      message: `Payout request ${status}`
    });

  } catch (error) {
    console.error('Payout PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}