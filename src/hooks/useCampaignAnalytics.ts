import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface CampaignAnalytics {
  id: string
  campaign_id: string
  influencer_id: string
  platform: string
  post_type: string
  post_url: string
  screenshot_url?: string
  views_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  saves_count?: number
  reach?: number
  impressions?: number
  engagement_rate: number
  click_through_rate?: number
  verification_status: 'pending' | 'verified' | 'rejected' | 'disputed'
  admin_notes?: string
  created_at: string
  updated_at: string
  campaigns?: {
    id: string
    title: string
    budget?: number
  }
  influencer?: {
    id: string
    user_role: string
    influencer_profiles: {
      first_name: string
      last_name: string
      avatar_url?: string
    }
  }
  influencer_profiles?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

interface UseCampaignAnalyticsOptions {
  campaignId?: string
  influencerId?: string
  businessId?: string
  verificationStatus?: string
  platform?: string
  limit?: number
}

export function useCampaignAnalytics(options: UseCampaignAnalyticsOptions = {}) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.campaignId) params.append('campaignId', options.campaignId)
      if (options.influencerId) params.append('influencerId', options.influencerId)
      if (options.businessId) params.append('businessId', options.businessId)
      if (options.verificationStatus) params.append('verificationStatus', options.verificationStatus)
      if (options.platform) params.append('platform', options.platform)
      if (options.limit) params.append('limit', options.limit.toString())

      const response = await fetch(`/api/campaign-analytics?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      setAnalytics(data.analytics || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [options.campaignId, options.influencerId, options.businessId, options.verificationStatus, options.platform, options.limit])

  const submitAnalytics = async (analyticsData: {
    campaign_id: string
    platform: string
    post_type: string
    post_url: string
    screenshot_url?: string
    views_count: number
    likes_count: number
    comments_count: number
    shares_count: number
    saves_count?: number
    reach?: number
    impressions?: number
    engagement_rate: number
    click_through_rate?: number
  }) => {
    try {
      const response = await fetch('/api/campaign-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit analytics')
      }

      toast.success('Analytics submitted successfully')
      await fetchAnalytics()
      return data.analytics
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit analytics'
      toast.error(errorMessage)
      throw err
    }
  }

  const updateAnalyticsStatus = async (
    id: string,
    status: 'verified' | 'rejected' | 'disputed',
    adminNotes?: string
  ) => {
    try {
      const response = await fetch('/api/campaign-analytics', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          verification_status: status,
          admin_notes: adminNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update analytics status')
      }

      toast.success(`Analytics ${status} successfully`)
      await fetchAnalytics()
      return data.analytics
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update analytics'
      toast.error(errorMessage)
      throw err
    }
  }

  const deleteAnalytics = async (id: string) => {
    try {
      const response = await fetch('/api/campaign-analytics', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete analytics')
      }

      toast.success('Analytics deleted successfully')
      setAnalytics(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete analytics'
      toast.error(errorMessage)
      throw err
    }
  }

  const topPerformingPosts = analytics
    .filter(a => a.verification_status === 'verified')
    .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      platform: a.platform,
      post_type: a.post_type,
      post_url: a.post_url,
      engagement_rate: a.engagement_rate || 0,
      views_count: a.views_count || 0,
      likes_count: a.likes_count || 0,
      comments_count: a.comments_count || 0,
      shares_count: a.shares_count || 0,
      campaign: a.campaigns ? { title: a.campaigns.title } : null,
      influencer: a?.influencer_profiles ? {
          first_name: a?.influencer_profiles.first_name,
          last_name: a?.influencer_profiles.last_name,
        avatar_url: a.influencer_profiles.avatar_url || ''
      } : null
    }))

  // Calculate stats
  const stats = {
    recentActivity: analytics.filter(a => {
      const createdAt = new Date(a.created_at)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return createdAt >= sevenDaysAgo
    }).length,
    total: analytics.length,
    pending: analytics.filter(a => a.verification_status === 'pending').length,
    verified: analytics.filter(a => a.verification_status === 'verified').length,
    rejected: analytics.filter(a => a.verification_status === 'rejected').length,
    disputed: analytics.filter(a => a.verification_status === 'disputed').length,
    totalViews: analytics.reduce((sum, a) => sum + (a.views_count || 0), 0),
    totalEngagement: analytics.reduce((sum, a) => {
      return sum + (a.likes_count || 0) + (a.comments_count || 0) + (a.shares_count || 0)
    }, 0),
    totalReach: analytics.reduce((sum, a) => sum + (a.reach || 0), 0),
    totalImpressions: analytics.reduce((sum, a) => sum + (a.impressions || 0), 0),
    averageEngagementRate: analytics.length 
      ? (analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / analytics.length)
      : 0,
    averageCTR: analytics.length 
      ? (analytics.reduce((sum, a) => sum + (a.click_through_rate || 0), 0) / analytics.length)
      : 0,
    platformBreakdown: analytics.reduce((acc, a) => {
      acc[a.platform] = (acc[a.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    postTypeBreakdown: analytics.reduce((acc, a) => {
      acc[a.post_type] = (acc[a.post_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    topPerformingPosts
  }

  return {
    analytics,
    loading,
    error,
    stats,
    topPosts: topPerformingPosts,
    refetch: fetchAnalytics,
    submitAnalytics,
    updateAnalyticsStatus,
    updateVerificationStatus: updateAnalyticsStatus, // Alias for admin compatibility
    deleteAnalytics,
  }
}

export function useCampaignAnalyticsById(id: string) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/campaign-analytics/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      setAnalytics(data.analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchAnalytics()
    }
  }, [id])

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  }
}