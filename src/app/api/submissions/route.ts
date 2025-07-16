import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    const { 
      applicationId, 
      title,
      description,
      notes, 
      images = [], 
      videos = [], 
      links = [], 
      documents = [],
      attachments = [] // Legacy support
    } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

     if (!title.trim() && !description.trim() && !notes.trim() && 
        images.length === 0 && videos.length === 0 && links.length === 0 && 
        documents.length === 0 && attachments.length === 0) {
      return NextResponse.json(
        { error: 'At least one field (title, description, notes, or media) must be provided' },
        { status: 400 }
      );
    }

    // Verify the application exists and user is the influencer
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        campaign:campaigns!applications_campaign_id_fkey(
          id,
          title,
          business_id
        )
      `)
      .eq('id', applicationId)
      .eq('influencer_id', user.id)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
    }

    // Check if application is approved
    if (application.status !== 'approved' && application.status !== 'revision_requested') {
      return NextResponse.json({ error: 'Can only submit work for approved or revision_requested applications' }, { status: 400 });
    }

    // Check if submission already exists
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('id, status')
      .eq('application_id', applicationId)
      .single();

    // If submission exists and is not in revision_requested status, block new submission
    if (existingSubmission && existingSubmission.status !== 'revision_requested') {
      return NextResponse.json({ error: 'Submission already exists for this application' }, { status: 400 });
    }

    // Calculate auto-approve date (7 days from submission)
    const autoApproveDate = new Date();
    autoApproveDate.setDate(autoApproveDate.getDate() + 7);

    let submission;
    let submissionError;

    if (existingSubmission && existingSubmission.status === 'revision_requested') {
      // Update existing submission for revision resubmission
      const { data: updatedSubmission, error: updateError } = await supabase
        .from('submissions')
        .update({
          title,
          description,
          notes,
          images,
          videos,
          links,
          documents,
          attachments, // Legacy support
          status: 'pending',
          auto_approve_date: autoApproveDate.toISOString(),
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reviewed_at: null, // Clear previous review
          review_notes: null // Clear previous review notes
        })
        .eq('id', existingSubmission.id)
        .select('*')
        .single();
      
      submission = updatedSubmission;
      submissionError = updateError;
    } else {
      // Create new submission record
      const { data: newSubmission, error: createError } = await supabase
        .from('submissions')
        .insert({
          application_id: applicationId,
          influencer_id: user.id,
          campaign_id: application.campaign.id,
          business_id: application.campaign.business_id,
          title,
          description,
          notes,
          images,
          videos,
          links,
          documents,
          attachments, // Legacy support
          status: 'pending',
          auto_approve_date: autoApproveDate.toISOString()
        })
        .select('*')
        .single();
      
      submission = newSubmission;
      submissionError = createError;
    }

    if (submissionError) {
      console.error('Submission creation/update error:', submissionError);
      return NextResponse.json({ error: 'Failed to create/update submission' }, { status: 500 });
    }

    // Update application status to submitted
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: 'submitted',
        work_submitted_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Application update error:', updateError);
      // Continue anyway as submission is recorded
    }

    // Update escrow auto-release date
    const { error: escrowUpdateError } = await supabase
      .from('escrow_accounts')
      .update({
        auto_release_date: autoApproveDate.toISOString()
      })
      .eq('application_id', applicationId)
      .eq('status', 'held');

    if (escrowUpdateError) {
      console.error('Escrow update error:', escrowUpdateError);
      // Continue anyway as submission is recorded
    }

    const isRevisionResubmission = existingSubmission && existingSubmission.status === 'revision_requested';
    const message = isRevisionResubmission 
      ? 'Revision submitted successfully. Business has 7 days to review.'
      : 'Work submitted successfully. Business has 7 days to review.';

    return NextResponse.json({
      success: true,
      submission,
      message
    });

  } catch (error) {
    console.error('Submission error:', error);
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
    const applicationId = searchParams.get('applicationId');
    const businessId = searchParams.get('businessId');
    const influencerId = searchParams.get('influencerId');
    const campaignId = searchParams.get('campaignId');

    let query = supabase
      .from('submissions')
      .select(`
        *,
        influencer:profiles!submissions_influencer_id_fkey(
          id,
          email,
          first_name,
          last_name
        ),
        campaign:campaigns!submissions_campaign_id_fkey(
          id,
          title
        )
      `)

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    if (influencerId) {
      query = query.eq('influencer_id', influencerId);
    }

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data: submissions, error } = await query
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Submissions fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Filter results based on user access
    const filteredSubmissions = submissions?.filter((submission: any) => {
      return submission.business_id === user.id || submission.influencer_id === user.id;
    }) || [];

    return NextResponse.json({ submissions: filteredSubmissions });

  } catch (error) {
    console.error('Submissions GET error:', error);
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

    const body = await request.json();
    const { submissionId, status, reviewNotes, revisionNotes } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
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

    // Check if user has permission to update
    if (submission.business_id !== user.id && submission.influencer_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update submission
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateData.status = status;
      if (status !== 'submitted') {
        updateData.reviewed_at = new Date().toISOString();
      }
    }

    if (reviewNotes) {
      updateData.review_notes = reviewNotes;
    }

    if (revisionNotes) {
      updateData.revision_notes = revisionNotes;
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

    // Update application status if needed
    if (status === 'approved') {
      await supabase
        .from('applications')
        .update({ status: 'completed' })
        .eq('id', submission.application_id);
    } else if (status === 'revision_requested') {
      await supabase
        .from('applications')
        .update({ 
          status: 'revision_requested',
          review_notes: reviewNotes || revisionNotes 
        })
        .eq('id', submission.application_id);
    } else if (status === 'rejected') {
      await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          review_notes: reviewNotes 
        })
        .eq('id', submission.application_id);
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission
    });

  } catch (error) {
    console.error('Submission update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}