import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const submissionId = params.id;
    const body = await request.json();
    const { status, notes } = body;

    if (!status || !['approved', 'rejected', 'revision_requested'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (approved, rejected, revision_requested)' },
        { status: 400 }
      );
    }

    // Get submission to verify access
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Only business owners can review submissions
    if (submission.business_id !== user.id) {
      return NextResponse.json({ error: 'Only business owners can review submissions' }, { status: 403 });
    }

    // Update submission
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.review_notes = notes;
    }

    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) {
      console.error('Submission update error:', updateError);
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
    }

    // Update application status based on submission review
    let applicationStatus;
    let applicationUpdateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (status) {
      case 'approved':
        applicationStatus = 'completed';
        break;
      case 'rejected':
        applicationStatus = 'rejected';
        applicationUpdateData.review_notes = notes;
        break;
      case 'revision_requested':
        applicationStatus = 'revision_requested';
        applicationUpdateData.review_notes = notes;
        break;
    }

    if (applicationStatus) {
      applicationUpdateData.status = applicationStatus;
      
      const { error: appUpdateError } = await supabase
        .from('applications')
        .update(applicationUpdateData)
        .eq('id', submission.application_id);

      if (appUpdateError) {
        console.error('Application update error:', appUpdateError);
        // Continue anyway as submission is updated
      }
    }

    // Create notification for influencer
    const notificationMessages: Record<string, string> = {
      'approved': 'Your submission has been approved!',
      'rejected': 'Your submission has been rejected.',
      'revision_requested': 'Revision requested for your submission.'
    };
    const notificationMessage = notificationMessages[status];

    await supabase
      .from('notifications')
      .insert({
        user_id: submission.influencer_id,
        type: 'submission_review',
        title: 'Submission Review',
        message: notificationMessage,
        data: {
          submission_id: submissionId,
          campaign_id: submission.campaign_id,
          status,
          notes
        }
      });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: `Submission ${status.replace('_', ' ')} successfully`
    });

  } catch (error) {
    console.error('Submission review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}