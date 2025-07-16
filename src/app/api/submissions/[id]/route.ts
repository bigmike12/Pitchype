import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const submissionId = params.id;

    const { data: submission, error } = await supabase
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
      .eq('id', submissionId)
      .single();

    if (error) {
      console.error('Submission fetch error:', error);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check if user has access to this submission
    if (submission.business_id !== user.id && submission.influencer_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ submission });

  } catch (error) {
    console.error('Submission GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}