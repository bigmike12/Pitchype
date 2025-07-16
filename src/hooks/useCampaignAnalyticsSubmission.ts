'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface AnalyticsSubmissionData {
  applicationId: string;
  campaignId: string;
  platform: string;
  post_type: string;
  post_url: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
    impressions?: number;
    reach?: number;
    engagement_rate?: number;
  };
  screenshot?: File;
  additional_notes?: string;
}

interface UseCampaignAnalyticsSubmissionReturn {
  submitAnalytics: (data: AnalyticsSubmissionData) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
  isSubmitting: boolean;
  isUploading: boolean;
}

export function useCampaignAnalyticsSubmission(): UseCampaignAnalyticsSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'analytics_screenshot');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const submitAnalytics = async (data: AnalyticsSubmissionData) => {
    setIsSubmitting(true);
    try {
      let screenshotUrl: string | undefined;
      
      // Upload screenshot if provided
      if (data.screenshot) {
        screenshotUrl = await uploadFile(data.screenshot);
      }

      const submissionData = {
        application_id: data.applicationId,
        campaign_id: data.campaignId,
        platform: data.platform,
        post_type: data.post_type,
        post_url: data.post_url,
        views_count: data.metrics.views || 0,
        likes_count: data.metrics.likes || 0,
        comments_count: data.metrics.comments || 0,
        shares_count: data.metrics.shares || 0,
        saves_count: data.metrics.clicks || 0,
        reach_count: data.metrics.reach || 0,
        impressions_count: data.metrics.impressions || 0,
        engagement_rate: data.metrics.engagement_rate || 0,
        click_through_rate: 0,
        screenshot_urls: screenshotUrl ? [screenshotUrl] : [],
        additional_notes: data.additional_notes,
      };

      const response = await fetch('/api/campaign-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit analytics');
      }

      const result = await response.json();
      toast.success('Analytics submitted successfully!');
      return result;
    } catch (error) {
      console.error('Error submitting analytics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit analytics';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitAnalytics,
    uploadFile,
    isSubmitting,
    isUploading,
  };
}