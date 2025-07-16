import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  application_id: string;
  business_id: string;
  influencer_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  business?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
  };
  influencer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  campaign?: {
    id: string;
    title: string;
    status: string;
  };
  isOnline?: boolean;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateConversationOnlineStatus: (conversations: Conversation[]) => Promise<Conversation[]>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const updateConversationOnlineStatus = useCallback(async (conversations: Conversation[]) => {
    // TODO: Implement real online status checking
    // For now, return conversations as-is
    return conversations.map(conv => ({ ...conv, isOnline: false }));
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      const conversationsWithStatus = await updateConversationOnlineStatus(
        data.conversations || []
      );
      setConversations(conversationsWithStatus);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      const errorMessage = 'Failed to load conversations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, updateConversationOnlineStatus]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    updateConversationOnlineStatus
  };
}