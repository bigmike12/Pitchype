'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SendMessageOptions {
  applicationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
}

interface SendMessageResponse {
  message: {
    id: string;
    application_id: string;
    sender_id: string;
    content: string;
    message_type: string;
    created_at: string;
    is_read: boolean;
  };
}

export function useSendMessage() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (options: SendMessageOptions): Promise<SendMessageResponse | null> => {
    if (!user?.id) {
      toast.error('You must be logged in to send messages');
      return null;
    }

    if (!options.content.trim()) {
      toast.error('Please enter a message');
      return null;
    }

    try {
      setSending(true);
      setError(null);

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          application_id: options.applicationId,
          content: options.content,
          message_type: options.messageType || 'text'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      toast.success('Message sent successfully!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setSending(false);
    }
  };

  return {
    sendMessage,
    sending,
    error
  };
}