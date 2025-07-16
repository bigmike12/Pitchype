import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an influencer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profile?.user_role !== 'influencer') {
      return NextResponse.json({ error: 'Only influencers can favorite campaigns' }, { status: 403 });
    }

    const { id: campaignId } = await params;

    // Check if campaign exists
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Add to favorites (upsert to handle duplicates)
    const { data, error } = await supabase
      .from('campaign_favorites')
      .upsert({
        influencer_id: user.id,
        campaign_id: campaignId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding favorite:', error);
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Campaign added to favorites' });
  } catch (error) {
    console.error('Error in favorites POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an influencer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profile?.user_role !== 'influencer') {
      return NextResponse.json({ error: 'Only influencers can unfavorite campaigns' }, { status: 403 });
    }

    const { id: campaignId } = await params;

    // Remove from favorites
    const { error } = await supabase
      .from('campaign_favorites')
      .delete()
      .eq('influencer_id', user.id)
      .eq('campaign_id', campaignId);

    if (error) {
      console.error('Error removing favorite:', error);
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Campaign removed from favorites' });
  } catch (error) {
    console.error('Error in favorites DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // Check if current user has favorited this campaign
    const { data: favorite } = await supabase
      .from('campaign_favorites')
      .select('id')
      .eq('influencer_id', user.id)
      .eq('campaign_id', campaignId)
      .single();

    // Get total favorites count for this campaign
    const { count } = await supabase
      .from('campaign_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    return NextResponse.json({ 
      isFavorited: !!favorite,
      favoritesCount: count || 0
    });
  } catch (error) {
    console.error('Error in favorites GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}