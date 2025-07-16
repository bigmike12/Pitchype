import { createServiceRoleClient } from '@/lib/server';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'campaign' | 'application' | 'payment' | 'message' | 'system';
  data?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const supabase = createServiceRoleClient();
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        data: params.data || {},
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return notification;
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return null;
  }
}

/**
 * Create notification for campaign application submission
 */
export async function notifyApplicationSubmitted({
  businessUserId,
  influencerName,
  campaignTitle,
  applicationId,
  campaignId
}: {
  businessUserId: string;
  influencerName: string;
  campaignTitle: string;
  applicationId: string;
  campaignId: string;
}) {
  return createNotification({
    userId: businessUserId,
    title: 'New Campaign Application',
    message: `${influencerName} has applied to your campaign "${campaignTitle}"`,
    type: 'application',
    data: {
      applicationId,
      campaignId,
      action: 'submitted'
    }
  });
}

/**
 * Create notification for campaign application approval
 */
export async function notifyApplicationApproved({
  influencerUserId,
  campaignTitle,
  businessName,
  applicationId,
  campaignId
}: {
  influencerUserId: string;
  campaignTitle: string;
  businessName: string;
  applicationId: string;
  campaignId: string;
}) {
  return createNotification({
    userId: influencerUserId,
    title: 'Application Approved! 🎉',
    message: `Your application for "${campaignTitle}" by ${businessName} has been approved`,
    type: 'application',
    data: {
      applicationId,
      campaignId,
      action: 'approved'
    }
  });
}

/**
 * Create notification for campaign application rejection
 */
export async function notifyApplicationRejected({
  influencerUserId,
  campaignTitle,
  businessName,
  applicationId,
  campaignId
}: {
  influencerUserId: string;
  campaignTitle: string;
  businessName: string;
  applicationId: string;
  campaignId: string;
}) {
  return createNotification({
    userId: influencerUserId,
    title: 'Application Update',
    message: `Your application for "${campaignTitle}" by ${businessName} was not selected this time`,
    type: 'application',
    data: {
      applicationId,
      campaignId,
      action: 'rejected'
    }
  });
}

/**
 * Create notification for new message
 */
export async function notifyNewMessage({
  recipientUserId,
  senderName,
  messagePreview,
  conversationId
}: {
  recipientUserId: string;
  senderName: string;
  messagePreview: string;
  conversationId: string;
}) {
  return createNotification({
    userId: recipientUserId,
    title: 'New Message',
    message: `${senderName}: ${messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview}`,
    type: 'message',
    data: {
      conversationId,
      senderName
    }
  });
}

/**
 * Create notification for payment received
 */
export async function notifyPaymentReceived({
  influencerUserId,
  amount,
  campaignTitle,
  paymentId
}: {
  influencerUserId: string;
  amount: number;
  campaignTitle: string;
  paymentId: string;
}) {
  return createNotification({
    userId: influencerUserId,
    title: 'Payment Received! 💰',
    message: `You've received ₦${amount.toLocaleString()} for "${campaignTitle}"`,
    type: 'payment',
    data: {
      paymentId,
      amount,
      campaignTitle
    }
  });
}

/**
 * Create notification for payment processed (business)
 */
export async function notifyPaymentProcessed({
  businessUserId,
  amount,
  campaignTitle,
  influencerName,
  paymentId
}: {
  businessUserId: string;
  amount: number;
  campaignTitle: string;
  influencerName: string;
  paymentId: string;
}) {
  return createNotification({
    userId: businessUserId,
    title: 'Payment Processed',
    message: `Payment of ₦${amount.toLocaleString()} to ${influencerName} for "${campaignTitle}" has been processed`,
    type: 'payment',
    data: {
      paymentId,
      amount,
      campaignTitle,
      influencerName
    }
  });
}

/**
 * Create notification for new campaign matching user profile
 */
export async function notifyNewCampaignMatch({
  influencerUserId,
  campaignTitle,
  businessName,
  campaignId
}: {
  influencerUserId: string;
  campaignTitle: string;
  businessName: string;
  campaignId: string;
}) {
  return createNotification({
    userId: influencerUserId,
    title: 'New Campaign Match! ✨',
    message: `"${campaignTitle}" by ${businessName} matches your profile`,
    type: 'campaign',
    data: {
      campaignId,
      businessName
    }
  });
}

/**
 * Create system notification
 */
export async function notifySystem({
  userId,
  title,
  message,
  data
}: {
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  return createNotification({
    userId,
    title,
    message,
    type: 'system',
    data
  });
}