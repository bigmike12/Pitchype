'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SocialMediaVerification {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  profile_url: string;
  follower_count: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_documents?: string[];
  additional_notes?: string;
  verification_notes?: string;
  created_at: string;
  verified_at?: string;
  profiles?: {
    id: string;
    user_role: string;
    influencer_profiles?: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
      bio?: string;
      specialties?: string[];
    };
  };
}

interface VerificationUpdateData {
  status: 'verified' | 'rejected';
  admin_notes?: string;
}

interface UseSocialMediaVerificationsReturn {
  verifications: SocialMediaVerification[];
  isLoading: boolean;
  isSubmitting: boolean;
  fetchVerifications: () => Promise<void>;
  updateVerificationStatus: (id: string, data: VerificationUpdateData) => Promise<void>;
  getVerificationsByStatus: (status: string) => SocialMediaVerification[];
  getVerificationStats: () => {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    recentActivity: number;
    platformStats: Record<string, number>;
  };
}

export function useSocialMediaVerifications(): UseSocialMediaVerificationsReturn {
  const [verifications, setVerifications] = useState<SocialMediaVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_media_verifications')
        .select(`
          *,
          profiles (
            id,
            user_role,
            influencer_profiles (
              first_name,
              last_name,
              avatar_url,
              bio,
              specialties
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const updateVerificationStatus = async (id: string, data: VerificationUpdateData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/social-media-verifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          verification_status: data.status,
          verification_notes: data.admin_notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update verification status');
      }

      // Refresh the verifications list
      await fetchVerifications();
      
      const statusMessages = {
        verified: 'Verification approved successfully!',
        rejected: 'Verification rejected successfully!'
      };
      
      toast.success(statusMessages[data.status]);
    } catch (error) {
      console.error('Error updating verification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update verification';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationsByStatus = (status: string): SocialMediaVerification[] => {
    if (status === 'all') return verifications;
    return verifications.filter(v => v.verification_status === status);
  };

  const getVerificationStats = () => {
    const total = verifications.length;
    const pending = verifications.filter(v => v.verification_status === 'pending').length;
    const verified = verifications.filter(v => v.verification_status === 'verified').length;
    const rejected = verifications.filter(v => v.verification_status === 'rejected').length;
    
    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = verifications.filter(v => new Date(v.created_at) > weekAgo).length;
    
    // Platform breakdown
    const platformStats = verifications.reduce((acc, v) => {
      acc[v.platform] = (acc[v.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      pending,
      verified,
      rejected,
      recentActivity,
      platformStats,
    };
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  return {
    verifications,
    isLoading,
    isSubmitting,
    fetchVerifications,
    updateVerificationStatus,
    getVerificationsByStatus,
    getVerificationStats,
  };
}