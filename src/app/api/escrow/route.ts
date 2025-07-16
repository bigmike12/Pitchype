import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

type EscrowAccount = Database['public']['Tables']['escrow_accounts']['Row'];
type InfluencerBalance = Database['public']['Tables']['influencer_balances']['Row'];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');

    let query = supabase
      .from('escrow_accounts')
      .select(`
        *,
        application:applications!escrow_accounts_application_id_fkey(
          id,
          status,
          influencer_id,
          campaign:campaigns!applications_campaign_id_fkey(
            id,
            title,
            business_id
          )
        ),
        payment:payments!escrow_accounts_payment_id_fkey(
          id,
          paid_at
        )
      `);

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: escrowAccounts, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Escrow fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch escrow accounts' }, { status: 500 });
    }

    // Filter results based on user access
    const filteredEscrow = escrowAccounts?.filter((escrow: any) => {
      const application = escrow.application;
      return application?.campaign?.business_id === user.id || application?.influencer_id === user.id;
    }) || [];

    return NextResponse.json({ escrowAccounts: filteredEscrow });

  } catch (error) {
    console.error('Escrow GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, applicationId, reason } = body;

    if (!action || !applicationId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, applicationId' },
        { status: 400 }
      );
    }

    // Verify the application and escrow exist
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .select(`
        *,
        application:applications!escrow_accounts_application_id_fkey(
          id,
          status,
          influencer_id,
          campaign:campaigns!applications_campaign_id_fkey(
            id,
            business_id
          )
        )
      `)
      .eq('application_id', applicationId)
      .eq('status', 'held')
      .single();

    if (escrowError || !escrow) {
      return NextResponse.json({ error: 'Escrow account not found or already processed' }, { status: 404 });
    }

    const application = escrow.application;
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (action === 'release') {
      // Only business owner can release escrow
      if (application.campaign?.business_id !== user.id) {
        return NextResponse.json({ error: 'Only campaign owner can release escrow' }, { status: 403 });
      }

      // Release escrow funds
      const { error: releaseError } = await supabase
        .from('escrow_accounts')
        .update({
          status: 'released',
          released_at: new Date().toISOString()
        })
        .eq('id', escrow.id);

      if (releaseError) {
        console.error('Escrow release error:', releaseError);
        return NextResponse.json({ error: 'Failed to release escrow' }, { status: 500 });
      }

      // Update application status to completed
      const { error: appUpdateError } = await supabase
        .from('applications')
        .update({ status: 'completed' })
        .eq('id', applicationId);

      if (appUpdateError) {
        console.error('Application update error:', appUpdateError);
      }

      // Update influencer balance
      const { error: balanceError } = await supabase
        .from('influencer_balances')
        .upsert({
          influencer_id: application.influencer_id,
          available_balance: escrow.amount,
          total_earned: escrow.amount
        }, {
          onConflict: 'influencer_id',
          ignoreDuplicates: false
        });

      if (balanceError) {
        console.error('Balance update error:', balanceError);
      }

      return NextResponse.json({
        success: true,
        message: 'Escrow funds released to influencer'
      });

    } else if (action === 'refund') {
      // Only business owner can request refund
      if (application.campaign?.business_id !== user.id) {
        return NextResponse.json({ error: 'Only campaign owner can request refund' }, { status: 403 });
      }

      // Refund escrow (this would typically involve payment processor integration)
      const { error: refundError } = await supabase
        .from('escrow_accounts')
        .update({
          status: 'refunded',
          released_at: new Date().toISOString()
        })
        .eq('id', escrow.id);

      if (refundError) {
        console.error('Escrow refund error:', refundError);
        return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
      }

      // Update application status
      const { error: appUpdateError } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (appUpdateError) {
        console.error('Application update error:', appUpdateError);
      }

      return NextResponse.json({
        success: true,
        message: 'Escrow refunded to business'
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Escrow POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}