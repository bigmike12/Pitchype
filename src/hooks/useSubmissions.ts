'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';

interface SubmissionData {
  id: string;
  application_id: string;
  influencer_id: string;
  campaign_id: string;
  business_id: string;
  title: string | null;
  description: string | null;
  notes: string | null;
  images: any[];
  videos: any[];
  links: any[];
  documents: any[];
  attachments: any[]; // Legacy support
  status: string;
  review_notes: string | null;
  revision_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  auto_approve_date: string | null;
  created_at: string;
  updated_at: string;
  // Optional enriched data
  influencer?: {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  campaign?: {
    id: string;
    title: string;
  };
};

interface UseSubmissionsResult {
  submissions: SubmissionData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSubmissions(campaignId?: string): UseSubmissionsResult {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/submissions';
      const params = new URLSearchParams();
      
      if (campaignId) {
        // We'll need to fetch by businessId since there's no direct campaign filter
        // For now, we'll fetch all and filter client-side
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submissions');
      }
      
      let filteredSubmissions = data.submissions || [];
      
      // Filter by campaign if campaignId is provided
      if (campaignId) {
        filteredSubmissions = filteredSubmissions.filter(
          (submission: SubmissionData) => submission.campaign_id === campaignId
        );
      }
      
      setSubmissions(filteredSubmissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [campaignId]);

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions
  };
}