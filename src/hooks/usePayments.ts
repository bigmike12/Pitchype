import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  amount: number;
  status: string;
  type: string;
  created_at: string;
  application_id?: string;
  influencer_id?: string;
  business_id?: string;
  campaign?: {
    id: string;
    title: string;
  };
  application?: {
    id: string;
    campaign?: {
      id: string;
      title: string;
    };
  };
}

interface UsePaymentsOptions {
  influencerId?: string;
  businessId?: string;
  status?: string;
  type?: string;
  dateRange?: string;
  limit?: number;
  page?: number;
}

interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePayments(options: UsePaymentsOptions = {}): UsePaymentsReturn {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPayments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.influencerId) params.append('influencerId', options.influencerId);
      if (options.businessId) params.append('businessId', options.businessId);
      if (options.status && options.status !== 'all') params.append('status', options.status);
      if (options.type && options.type !== 'all') params.append('type', options.type);
      if (options.dateRange && options.dateRange !== 'all') params.append('dateRange', options.dateRange);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.page) params.append('page', options.page.toString());

      const response = await fetch(`/api/payments?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payments');
      }

      setPayments(data.payments || data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load payments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, options.influencerId, options.businessId, options.status, options.type, options.dateRange, options.limit, options.page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments
  };
}

// Hook specifically for recent earnings (influencer dashboard)
export function useRecentEarnings(limit: number = 4) {
  const { user } = useAuth();
  
  return usePayments({
    influencerId: user?.id,
    limit
  });
}