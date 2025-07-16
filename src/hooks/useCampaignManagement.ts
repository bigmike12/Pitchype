'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  budget_min?: number;
  budget_max?: number;
  minimum_followers?: number;
  deliverables?: string[];
  target_audience?: string;
  platforms?: string[];
  guidelines?: string;
  start_date?: string;
  end_date?: string;
  required_influencers?: number;
  status: string;
  tags?: string[];
  campaign_goals?: string[];
  created_at?: string;
  updated_at?: string;
}

interface CampaignUpdateData {
  title: string;
  description: string;
  requirements?: string;
  budget_min?: number;
  budget_max?: number;
  minimum_followers?: number;
  deliverables?: string[];
  target_audience?: string;
  platforms?: string[];
  guidelines?: string;
  start_date?: string;
  end_date?: string;
  required_influencers?: number;
  status: string;
  tags?: string[];
  campaign_goals?: string[];
}

interface UseCampaignManagementReturn {
  campaign: Campaign | null;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchCampaign: (id: string) => Promise<void>;
  updateCampaign: (id: string, data: CampaignUpdateData) => Promise<void>;
}

export function useCampaignManagement(): UseCampaignManagementReturn {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCampaign = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }

      const data = await response.json();
      const campaignData = data.campaign || data;
      setCampaign(campaignData);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to load campaign data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaign = async (id: string, data: CampaignUpdateData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update campaign');
      }

      const result = await response.json();
      setCampaign(result.campaign || result);
      toast.success('Campaign updated successfully!');
      return result;
    } catch (error) {
      console.error('Error updating campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    campaign,
    isLoading,
    isSubmitting,
    fetchCampaign,
    updateCampaign,
  };
}