import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';
import { notifyApplicationApproved, notifyApplicationRejected } from '@/lib/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        campaign:campaigns(
          id,
          title,
          description,
          budget_min,
          budget_max,
          deliverables,
          requirements,
          status,
          business:profiles!campaigns_business_id_fkey(
            id,
            business_profiles(
              first_name,
              last_name,
              company_name,
              industry,
              website_url,
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
            bio,
            instagram_handle,
            tiktok_handle,
            youtube_handle,
            follower_count,
            engagement_rate,
            avatar_url
          )
        ),
        messages:messages(
          id,
          content,
          message_type,
          attachments,
          is_read,
          created_at,
          sender:profiles!messages_sender_id_fkey(
            id,
            user_role
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching application:', error);
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the application with campaign info
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select(`
        *,
        campaign:campaigns(
          business_id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { status, proposal, proposed_rate, estimated_reach, portfolio_links } = body;

    // Check permissions
    const isInfluencer = application.influencer_id === user.id;
    const isBusiness = application.campaign?.business_id === user.id;

    if (!isInfluencer && !isBusiness) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update applications you are involved in' },
        { status: 403 }
      );
    }

    // Prepare update data based on user role
    let updateData: any = {};

    if (isInfluencer) {
      // Influencers can update their proposal details and withdraw
      if (proposal !== undefined) updateData.proposal = proposal;
      if (proposed_rate !== undefined) updateData.proposed_rate = proposed_rate;
      if (estimated_reach !== undefined) updateData.estimated_reach = estimated_reach;
      if (portfolio_links !== undefined) updateData.portfolio_links = portfolio_links;
      
      // Influencers can only set status to 'withdrawn'
      if (status === 'withdrawn') {
        updateData.status = status;
      } else if (status && status !== 'withdrawn') {
        return NextResponse.json(
          { error: 'Influencers can only withdraw their applications' },
          { status: 403 }
        );
      }
    }

    if (isBusiness) {
      // Business users can update application status
      if (status && ['approved', 'rejected'].includes(status)) {
        updateData.status = status;
        updateData.reviewed_at = new Date().toISOString();
        
        // If application is approved, update campaign status to 'in-progress' and create payment
        if (status === 'approved') {
          const { error: campaignError } = await supabase
            .from('campaigns')
            .update({ status: 'in-progress' })
            .eq('id', application.campaign_id);
            
          if (campaignError) {
            console.error('Error updating campaign status:', campaignError);
            // Don't fail the application update if campaign update fails
          }

          // Create payment record for the approved application
          try {
            // First check if payment already exists
            const { data: existingPayment, error: paymentCheckError } = await supabase
              .from('payments')
              .select('id')
              .eq('application_id', application.id)
              .single();

            if (!existingPayment && !paymentCheckError) {
              const { data: campaign, error: campaignFetchError } = await supabase
                .from('campaigns')
                .select('budget_min, budget_max, title')
                .eq('id', application.campaign_id)
                .single();

              if (!campaignFetchError && campaign) {
                const paymentAmount = application.proposed_rate || campaign.budget_min || 0;
                
                const { error: paymentError } = await supabase
                  .from('payments')
                  .insert({
                    application_id: application.id,
                    amount: paymentAmount,
                    status: 'pending'
                  });

                if (paymentError) {
                  console.error('Error creating payment record:', paymentError);
                  // Don't fail the application approval if payment creation fails
                }
              }
            } else if (existingPayment) {
              console.log('Payment already exists for application:', application.id);
            }
          } catch (paymentCreationError) {
            console.error('Error in payment creation process:', paymentCreationError);
          }
        }
      } else if (status && !['approved', 'rejected'].includes(status)) {
        return NextResponse.json(
          { error: 'Business users can only approve or reject applications' },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: updatedApplication, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
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
      `)
      .single();

    if (error) {
      console.error('Error updating application:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    // Send notifications for status changes
    if (isBusiness && status && ['approved', 'rejected'].includes(status)) {
      try {
        if (status === 'approved') {
          await notifyApplicationApproved({
            influencerUserId: updatedApplication.influencer_id,
            campaignTitle: updatedApplication.campaign?.title || 'Campaign',
            businessName: updatedApplication.campaign?.business?.business_profiles?.company_name || 'Business',
            applicationId: updatedApplication.id,
            campaignId: updatedApplication.campaign_id
          });
        } else if (status === 'rejected') {
          await notifyApplicationRejected({
            influencerUserId: updatedApplication.influencer_id,
            campaignTitle: updatedApplication.campaign?.title || 'Campaign',
            businessName: updatedApplication.campaign?.business?.business_profiles?.company_name || 'Business',
            applicationId: updatedApplication.id,
            campaignId: updatedApplication.campaign_id
          });
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the application update if notification fails
      }
    }

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns this application (influencer only)
    const { data: existingApplication, error: fetchError } = await supabase
      .from('applications')
      .select('influencer_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    if (existingApplication.influencer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own applications' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting application:', error);
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}