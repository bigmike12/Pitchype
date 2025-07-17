import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Database } from '@/types/database';

type Application = Database['public']['Tables']['applications']['Row'] & {
  campaign?: {
    id: string;
    title: string;
    description: string | null;
    budget_min: number | null;
    budget_max: number | null;
    status: string;
    business?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      company_name: string | null;
      avatar_url: string | null;
    };
  };
  influencer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    social_links: any;
  };
  messages?: Array<{
    id: string;
    content: string | null;
    message_type: string;
    attachments: any;
    is_read: boolean;
    created_at: string;
    sender?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    };
  }>;
};

interface UseApplicationsOptions {
  campaignId?: string;
  influencerId?: string;
  businessId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useApplications(options: UseApplicationsOptions = {}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.campaignId) params.append('campaignId', options.campaignId);
      if (options.influencerId) params.append('influencerId', options.influencerId);
      if (options.businessId) params.append('businessId', options.businessId);
      if (options.status) params.append('status', options.status);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/applications?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
      }

      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [options.campaignId, options.influencerId, options.businessId, options.status, options.page, options.limit]);

  useEffect(() => {
    fetchApplications();
  }, [options.campaignId, options.influencerId, options.businessId, options.status, options.page, options.limit]);

  const createApplication = useCallback(async (applicationData: {
    campaign_id: string;
    proposal: string;
    proposed_rate?: number;
    estimated_reach?: number;
    portfolio_links?: string[];
  }) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create application');
      }

      // Refresh applications list
      await fetchApplications();
      return data.application;
    } catch (err) {
      throw err;
    }
  }, [fetchApplications]);

  const updateApplication = useCallback(async (id: string, applicationData: {
    status?: string;
    proposal?: string;
    proposed_rate?: number;
    estimated_reach?: number;
    portfolio_links?: string[];
  }) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update application');
      }

      // Update local state
      setApplications(prev => 
        prev.map(application => 
          application.id === id ? { ...application, ...data.application } : application
        )
      );

      return data.application;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteApplication = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete application');
      }

      // Remove from local state
      setApplications(prev => prev.filter(application => application.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  };
}

export function useApplication(id: string) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/applications/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch application');
      }

      setApplication(data.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const updateApplication = useCallback(async (applicationData: {
    status?: string;
    proposal?: string;
    proposed_rate?: number;
    estimated_reach?: number;
    portfolio_links?: string[];
  }) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update application');
      }

      setApplication(data.application);
      return data.application;
    } catch (err) {
      throw err;
    }
  }, [id]);

  return {
    application,
    loading,
    error,
    refetch: fetchApplication,
    updateApplication,
  };
}

// Additional hook for bank management and application status checking
interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationStatus {
  hasApplied: boolean;
  application?: {
    id: string;
    status: string;
    created_at: string;
    proposal: string;
  };
}

export function useApplicationManagement() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const fetchBanks = useCallback(async () => {
    setIsLoadingBanks(true);
    try {
      const response = await fetch('https://api.paystack.co/bank', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch banks');
      }

      const data = await response.json();
      setBanks(data.data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to load banks');
    } finally {
      setIsLoadingBanks(false);
    }
  }, []);

  const checkApplicationStatus = useCallback(async (campaignId: string) => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/applications?campaign_id=${campaignId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setApplicationStatus({ hasApplied: false });
          return;
        }
        throw new Error('Failed to check application status');
      }

      const data = await response.json();
      setApplicationStatus({
        hasApplied: true,
        application: data.application || data,
      });
    } catch (error) {
      console.error('Error checking application status:', error);
      setApplicationStatus({ hasApplied: false });
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  return {
    banks,
    isLoadingBanks,
    applicationStatus,
    isCheckingStatus,
    fetchBanks,
    checkApplicationStatus,
  };
}