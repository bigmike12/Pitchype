'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseApplicationStatusOptions {
  campaignId?: string;
}

interface ApplicationStatus {
  hasApplied: boolean;
  applicationId?: string;
  status?: string;
}

export function useApplicationStatus(options: UseApplicationStatusOptions = {}) {
  const { user } = useAuth();
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({
    hasApplied: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApplicationStatus = async () => {
    if (!options.campaignId || !user?.id) {
      setApplicationStatus({ hasApplied: false });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/applications?campaignId=${options.campaignId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to check application status');
      }
      
      const data = await response.json();
      const hasApplication = data.applications && data.applications.length > 0;
      
      setApplicationStatus({
        hasApplied: hasApplication,
        applicationId: hasApplication ? data.applications[0].id : undefined,
        status: hasApplication ? data.applications[0].status : undefined
      });
    } catch (err) {
      console.error('Error checking application status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check application status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApplicationStatus();
  }, [options.campaignId, user?.id]);

  return {
    applicationStatus,
    loading,
    error,
    refetch: checkApplicationStatus
  };
}