import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TopPerformer {
  id: string;
  name: string;
  handle: string;
  avatar: string | null;
  followers: number;
  engagement: number;
  campaigns: number;
  niche: string | null;
}

interface UseTopPerformersOptions {
  businessId?: string;
  limit?: number;
}

interface UseTopPerformersReturn {
  topPerformers: TopPerformer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTopPerformers(options: UseTopPerformersOptions = {}): UseTopPerformersReturn {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTopPerformers = useCallback(async () => {
    const businessId = options.businessId || user?.id;
    if (!businessId) return;

    try {
      setLoading(true);
      setError(null);

      const limit = options.limit || 3;
      const response = await fetch(`/api/applications?businessId=${businessId}&status=approved&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch top performers');
      }

      const responseData = await response.json();
      
      // Handle different response formats
      const data = Array.isArray(responseData) ? responseData : 
                   responseData.applications || responseData.data || [];
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array');
      }
      
      const performers = data.map((app: any) => {
        const influencer = app.influencer;
        const fullName = influencer.first_name && influencer.last_name 
          ? `${influencer.first_name} ${influencer.last_name}` 
          : influencer.first_name || influencer.last_name || 'Unknown';
        const handle = influencer.instagram_handle || influencer.youtube_handle || influencer.tiktok_handle || 'unknown';
        
        return {
          id: influencer.id,
          name: fullName,
          handle: `@${handle}`,
          avatar: influencer.avatar_url,
          followers: influencer.instagram_followers || influencer.youtube_subscribers || influencer.tiktok_followers || 0,
          engagement: Math.round(Math.random() * 10 + 1), // Mock engagement rate
          campaigns: 1 // Each application represents one campaign
        };
      });

      setTopPerformers(performers.map(performer => ({
        ...performer,
        niche: null // Add missing required niche property
      })));
    } catch (error) {
      console.error('Error fetching top performers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load top performers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, options.businessId, options.limit]);

  useEffect(() => {
    fetchTopPerformers();
  }, [fetchTopPerformers]);

  return {
    topPerformers,
    loading,
    error,
    refetch: fetchTopPerformers
  };
}