import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

type InfluencerBalance = Database['public']['Tables']['influencer_balances']['Row'];

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Only influencers can access balance information' }, { status: 403 });
    }

    // Get or create influencer balance
    let { data: balance, error: balanceError } = await supabase
      .from('influencer_balances')
      .select('*')
      .eq('influencer_id', user.id)
      .single();

    if (balanceError && balanceError.code === 'PGRST116') {
      // Balance doesn't exist, create it
      const { data: newBalance, error: createError } = await supabase
        .from('influencer_balances')
        .insert({
          influencer_id: user.id,
          available_balance: 0,
          pending_balance: 0,
          total_earned: 0,
          currency: 'NGN'
        })
        .select()
        .single();

      if (createError) {
        console.error('Balance creation error:', createError);
        return NextResponse.json({ error: 'Failed to create balance record' }, { status: 500 });
      }

      balance = newBalance;
    } else if (balanceError) {
      console.error('Balance fetch error:', balanceError);
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }

    return NextResponse.json({ balance });

  } catch (error) {
    console.error('Influencer balance GET error:', error);
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

    // This endpoint is typically used internally by the system
    // For security, we'll require admin access for manual balance updates
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can manually update balances' }, { status: 403 });
    }

    const body = await request.json();
    const { influencerId, availableBalance, pendingBalance, totalEarned } = body;

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      );
    }

    // Verify influencer exists
    const { data: influencer, error: influencerError } = await supabase
      .from('profiles')
      .select('id, user_role')
      .eq('id', influencerId)
      .eq('user_role', 'influencer')
      .single();

    if (influencerError || !influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
    }

    // Update balance
    const updateData: Partial<InfluencerBalance> = {
      updated_at: new Date().toISOString()
    };

    if (availableBalance !== undefined) {
      updateData.available_balance = availableBalance;
    }
    if (pendingBalance !== undefined) {
      updateData.pending_balance = pendingBalance;
    }
    if (totalEarned !== undefined) {
      updateData.total_earned = totalEarned;
    }

    const { data: updatedBalance, error: updateError } = await supabase
      .from('influencer_balances')
      .update(updateData)
      .eq('influencer_id', influencerId)
      .select()
      .single();

    if (updateError) {
      console.error('Balance update error:', updateError);
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      balance: updatedBalance,
      message: 'Balance updated successfully'
    });

  } catch (error) {
    console.error('Influencer balance PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}