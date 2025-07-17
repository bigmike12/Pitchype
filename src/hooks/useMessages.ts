import { useState, useEffect, useCallback } from 'react';
import { Database } from '@/types/database';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
};

interface UseMessagesOptions {
  applicationId: string;
  page?: number;
  limit?: number;
}

export function useMessages(options: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('applicationId', options.applicationId);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/messages?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [options.applicationId, options.page, options.limit]);

  useEffect(() => {
    if (options.applicationId && options.applicationId !== "skip" && options.applicationId.trim() !== "") {
      fetchMessages();
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [options.applicationId, options.page, options.limit]);

  const sendMessage = useCallback(async (messageData: {
    content: string;
    message_type?: string;
    attachments?: any[];
  }) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: options.applicationId,
          ...messageData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add new message to local state
      setMessages(prev => [...prev, data.message]);
      return data.message;
    } catch (err) {
      throw err;
    }
  }, [options.applicationId]);

  const markAsRead = useCallback(async (messageIds: string[]) => {
    try {
      // Update local state immediately for better UX
      setMessages(prev => 
        prev.map(message => 
          messageIds.includes(message.id) 
            ? { ...message, is_read: true }
            : message
        )
      );

      // Note: In a real implementation, you might want to create a separate API endpoint
      // for marking messages as read, or handle this automatically when fetching messages
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, ...updates }
          : message
      )
    );
  }, []);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    sendMessage,
    markAsRead,
    addMessage,
    updateMessage,
  };
}

// Hook for real-time message updates (can be extended with WebSocket/Supabase realtime)
export function useRealtimeMessages(applicationId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    // TODO: Implement real-time subscription using Supabase realtime
    // For now, we'll just simulate connection
    setIsConnected(true);

    // Cleanup function
    return () => {
      setIsConnected(false);
    };
  }, [applicationId]);

  const subscribeToMessages = (callback: (message: Message) => void) => {
    // TODO: Implement real-time message subscription
    // This would typically use Supabase realtime or WebSocket
    
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from messages');
    };
  };

  return {
    isConnected,
    lastMessage,
    subscribeToMessages,
  };
}