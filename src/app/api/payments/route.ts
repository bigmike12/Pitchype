import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const applicationId = searchParams.get('applicationId');
    const businessId = searchParams.get('businessId');
    const influencerId = searchParams.get('influencerId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('payments')
      .select(`
        *,
        application:applications(
          id,
          status,
          campaign:campaigns(
            id,
            title,
            business:profiles!campaigns_business_id_fkey(
              id,
              business_profiles(
                first_name,
                last_name,
                company_name,
                avatar_url
              )
            )
          ),
          influencer:profiles!applications_influencer_id_fkey(
            id,
            user_role,
            influencer_profiles(
              first_name,
              last_name,
              avatar_url
            )
          )
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Filter by user access
    if (businessId) {
      // Business user viewing their payments
      query = query.eq('application.campaign.business_id', businessId);
    } else if (influencerId) {
      // Influencer viewing their payments
      query = query.eq('application.influencer_id', influencerId);
    } else {
      // Default: show payments for current user
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

      if (userProfile?.user_role === 'business') {
        query = query.eq('application.campaign.business_id', user.id);
      } else {
        query = query.eq('application.influencer_id', user.id);
      }
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Unexpected error:', error);
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
    const { 
      applicationId, 
      amount, 
      transactionFee, 
      totalAmount, 
      paystackReference,
      metadata = {} 
    } = body;

    if (!applicationId || !amount || !paystackReference) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, amount, paystackReference' },
        { status: 400 }
      );
    }

    // Verify the application exists and user has access
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        campaign:campaigns!applications_campaign_id_fkey(
          id,
          business_id,
          title
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify user is the business owner of the campaign
    if (application.campaign.business_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to application' }, { status: 403 });
    }

    // Check if payment already exists for this application
    const { data: existingPayment, error: existingPaymentError } = await supabase
      .from('payments')
      .select('id, status')
      .eq('application_id', applicationId)
      .single();

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${paystackReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!paystackResponse.ok) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const paystackData = await paystackResponse.json();
    
    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    // Verify amount matches (Paystack returns amount in kobo)
    const paystackAmount = paystackData.data.amount / 100;
    if (Math.abs(paystackAmount - totalAmount) > 0.01) {
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
    }

    // Create or update payment record
    let payment, paymentError;
    
    if (existingPayment && !existingPaymentError) {
      // Update existing payment
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          amount: amount,
          currency: 'NGN',
          status: 'in_escrow',
          paid_at: new Date().toISOString()
        })
        .eq('id', existingPayment.id)
        .select()
        .single();
      
      payment = updatedPayment;
      paymentError = updateError;
    } else {
      // Create new payment record
      const { data: newPayment, error: insertError } = await supabase
        .from('payments')
        .insert({
          application_id: applicationId,
          amount: amount,
          currency: 'NGN',
          status: 'in_escrow',
          paid_at: new Date().toISOString()
        })
        .select()
        .single();
      
      payment = newPayment;
      paymentError = insertError;
    }

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Create escrow account
    const autoReleaseDate = new Date();
    autoReleaseDate.setDate(autoReleaseDate.getDate() + 7); // 7 days from now

    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_accounts')
      .insert({
        application_id: applicationId,
        payment_id: payment.id,
        amount: amount,
        currency: 'NGN',
        status: 'held',
        auto_release_date: autoReleaseDate.toISOString()
      })
      .select()
      .single();

    if (escrowError) {
      console.error('Escrow creation error:', escrowError);
      // Try to rollback payment
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id);
      
      return NextResponse.json({ error: 'Failed to create escrow account' }, { status: 500 });
    }

    // Update application status to approved
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Application update error:', updateError);
      // Continue anyway as payment and escrow are created
    }

    return NextResponse.json({
      success: true,
      payment,
      escrow,
      message: 'Payment processed and funds held in escrow'
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}