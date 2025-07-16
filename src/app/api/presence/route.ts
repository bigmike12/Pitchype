import { createClient } from '@/lib/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId: string;
    let onlineStatus: boolean;

    // Handle both JSON and FormData (for sendBeacon)
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      userId = body.user_id || user.id;
      onlineStatus = body.online_status === true || body.online_status === 'true';
    } else {
      // Handle FormData from sendBeacon
      const formData = await request.formData();
      userId = formData.get('user_id') as string || user.id;
      onlineStatus = formData.get('online_status') === 'true';
    }

    // Ensure user can only update their own presence
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Can only update own presence' },
        { status: 403 }
      );
    }

    // Update user presence
    const { error } = await supabase.rpc('update_user_presence', {
      user_uuid: userId,
      online_status: onlineStatus
    });

    if (error) {
      console.error('Error updating presence:', error);
      return NextResponse.json(
        { error: 'Failed to update presence' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in presence API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userIds = searchParams.get('user_ids')?.split(',') || [];
    const singleUserId = searchParams.get('user_id');

    if (singleUserId) {
      // Get single user presence
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, is_online, last_seen')
        .eq('user_id', singleUserId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to get user presence' },
          { status: 500 }
        );
      }

      // Check if user is actually online (last seen within 5 minutes)
      const lastSeen = new Date(data?.last_seen || 0);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isOnline = data?.is_online && lastSeen > fiveMinutesAgo;

      return NextResponse.json({
        user_id: singleUserId,
        is_online: isOnline,
        last_seen: data?.last_seen
      });
    } else if (userIds.length > 0) {
      // Get multiple users presence
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, is_online, last_seen')
        .in('user_id', userIds);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to get users presence' },
          { status: 500 }
        );
      }

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const presenceMap: Record<string, boolean> = {};

      data?.forEach((presence) => {
        const lastSeen = new Date(presence.last_seen);
        presenceMap[presence.user_id] = presence.is_online && lastSeen > fiveMinutesAgo;
      });

      return NextResponse.json({ presence: presenceMap });
    } else {
      return NextResponse.json(
        { error: 'user_id or user_ids parameter required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in presence GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}