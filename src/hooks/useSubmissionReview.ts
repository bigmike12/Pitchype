'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Submission {
  id: string;
  campaign_id: string;
  influencer_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
  files?: string[];
  deliverables?: string[];
  auto_approve_date: string;
  application_id: string;
  title: string | null;
  description: string | null;
  notes: string | null;
  images: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  videos: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  links: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  documents: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  attachments: Array<{
    url: string;
    description: string;
  }> | null;
  revision_notes: string | null;
  application: {
    id: string;
    status: string;
    campaign: {
      title: string;
      budget: number;
    };
    influencer: {
      username: string;
    };
  };
}

interface ReviewData {
  status: 'approved' | 'rejected' | 'revision_requested';
  notes?: string;
}

interface UseSubmissionReviewReturn {
  submission: Submission | null;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchSubmission: (id: string) => Promise<void>;
  reviewSubmission: (id: string, reviewData: ReviewData) => Promise<void>;
}

export function useSubmissionReview(): UseSubmissionReviewReturn {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubmission = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/submissions/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch submission');
      }

      const data = await response.json();
      setSubmission(data.submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast.error('Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  };

  const reviewSubmission = async (id: string, reviewData: ReviewData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/submissions/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to review submission');
      }

      const result = await response.json();
      setSubmission(result.submission);
      
      const statusMessages = {
        approved: 'Submission approved successfully!',
        rejected: 'Submission rejected.',
        revision_requested: 'Revision requested successfully!'
      };
      
      toast.success(statusMessages[reviewData.status]);
    } catch (error) {
      console.error('Error reviewing submission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to review submission';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submission,
    isLoading,
    isSubmitting,
    fetchSubmission,
    reviewSubmission,
  };
}