import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';
import { notifyNewMessage } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const applicationId = searchParams.get('applicationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to this application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        influencer_id,
        campaigns!inner(
          business_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const isInfluencer = application.influencer_id === user.id;
    const isBusiness = (application.campaigns as any)?.[0]?.business_id === user.id;

    if (!isInfluencer && !isBusiness) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view messages for applications you are involved in' },
        { status: 403 }
      );
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(
          id,
          user_role,
          email
        )
      `)
      .eq('application_id', applicationId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Mark messages as read for the current user
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('application_id', applicationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({ messages });
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
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      application_id,
      content,
      message_type = 'text',
      attachments = []
    } = body;

    // Validate required fields
    if (!application_id || !content) {
      return NextResponse.json(
        { error: 'Application ID and content are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        influencer_id,
        campaigns!inner(
          business_id
        )
      `)
      .eq('id', application_id)
      .single();

    if (appError) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const isInfluencer = application.influencer_id === user.id;
    const isBusiness = (application.campaigns as any)?.[0]?.business_id === user.id;

    if (!isInfluencer && !isBusiness) {
      return NextResponse.json(
        { error: 'Forbidden: You can only send messages for applications you are involved in' },
        { status: 403 }
      );
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        application_id,
        sender_id: user.id,
        content,
        message_type,
        attachments,
        is_read: false
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(
          id,
          user_role,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Send notification to the recipient
    try {
      const recipientId = isInfluencer ? (application.campaigns as any)?.[0]?.business_id : application.influencer_id;
      
      if (recipientId) {
        // Get sender's name for the notification
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select(`
            user_role,
            business_profiles(first_name, last_name),
            influencer_profiles(first_name, last_name)
          `)
          .eq('id', user.id)
          .single();
        
        let senderName = 'Someone';
        if (senderProfile) {
          const profile = senderProfile.user_role === 'business' 
            ? senderProfile.business_profiles[0]
            : senderProfile.influencer_profiles[0];
          if (profile) {
            senderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          }
        }
        
        await notifyNewMessage({
          recipientUserId: recipientId,
          senderName,
          conversationId: application_id,
          messagePreview: content.substring(0, 100)
        });
      }
    } catch (notificationError) {
      console.error('Error sending message notification:', notificationError);
      // Don't fail the message creation if notification fails
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}