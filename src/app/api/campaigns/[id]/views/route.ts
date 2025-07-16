import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: campaignId } = await params;

    // Check if campaign exists
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, view_count')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Increment view count
    const { data, error } = await supabase
      .from('campaigns')
      .update({ view_count: (campaign.view_count || 0) + 1 })
      .eq('id', campaignId)
      .select('view_count')
      .single();

    if (error) {
      console.error('Error incrementing view count:', error);
      return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
    }

    return NextResponse.json({ view_count: data.view_count });
  } catch (error) {
    console.error('Error in views POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = await params;

  if (!campaignId) {
    return NextResponse.json({ error: 'Missing campaign ID' }, { status: 400 });
  }

  const supabase = await createClient();

  // Example: increment view count or fetch views
   const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('view_count')
    .eq('id', campaignId)
    .single();

  if (error || !campaign) {
    console.error('Error fetching view count:', error);
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  return NextResponse.json({ view_count: campaign.view_count });
}