'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface SubmissionData {
  campaignId: string;
  title?: string;
  description?: string;
  notes?: string;
  images?: Array<{ url: string; description: string }>;
  videos?: Array<{ url: string; description: string }>;
  links?: Array<{ url: string; description: string }>;
  documents?: Array<{ url: string; description: string }>;
  // Legacy support for the old structure
  content?: string;
  deliverables?: string[];
  files?: File[];
}

interface SubmissionActionData {
  submissionId: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  reviewNotes?: string;
}

interface UseSubmissionActionsReturn {
  submitWork: (data: SubmissionData) => Promise<void>;
  updateSubmissionStatus: (data: SubmissionActionData) => Promise<void>;
  isSubmitting: boolean;
  isUpdating: boolean;
}

export function useSubmissionActions(): UseSubmissionActionsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const submitWork = async (data: SubmissionData) => {
    setIsSubmitting(true);
    
    try {
      // Your SubmitWork component is calling this with a different structure
      // Let's handle the actual structure from your component
      const requestBody = {
        applicationId: data.campaignId,
        title: data.title || '',
        description: data.description || '',
        notes: data.notes || '',
        images: data.images || [],
        videos: data.videos || [],
        links: data.links || [],
        documents: data.documents || []
      };

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit work');
      }

      const result = await response.json();
      toast.success('Work submitted successfully!');
      return result;
    } catch (error) {
      console.error('Error submitting work:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit work';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSubmissionStatus = async (data: SubmissionActionData) => {
    setIsUpdating(true);
    try {
      // Use the review endpoint for status updates
      const response = await fetch(`/api/submissions/${data.submissionId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: data.status,
          notes: data.reviewNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update submission status');
      }

      const result = await response.json();
      
      // Show success message based on status
      const statusMessages = {
        approved: 'Submission approved successfully',
        rejected: 'Submission rejected',
        revision_requested: 'Revision requested',
        pending: 'Submission status updated'
      };
      
      toast.success(statusMessages[data.status] || 'Status updated successfully');
      
      return result;
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update submission status');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    submitWork,
    updateSubmissionStatus,
    isSubmitting,
    isUpdating,
  };
}