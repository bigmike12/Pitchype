'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/client'
import { useCampaignAnalytics } from '@/hooks/useCampaignAnalytics'
import AnalyticsVerificationCard from '@/components/campaign-analytics/AnalyticsVerificationCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  Eye,
  Users,
  DollarSign
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function AdminAnalyticsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  // Use the campaign analytics hook for admin (all analytics)
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    stats,
    refetch: refetchAnalytics,
    updateVerificationStatus
  } = useCampaignAnalytics()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    if (!loading && userProfile?.user_role !== 'admin') {
      router.push('/dashboard')
      return
    }
  }, [user, userProfile, loading, router])
  
  // Use stats from the hook
  const {
    total: totalSubmissions,
    pending: pendingCount,
    verified: verifiedCount,
    rejected: rejectedCount,
    disputed: disputedCount,
    totalViews,
    totalEngagement,
    averageEngagementRate,
    platformBreakdown: platformStats,
    recentActivity
  } = stats
  
  // Filter analytics by status
  const pendingSubmissions = analytics.filter(a => a.verification_status === 'pending')
  const verifiedSubmissions = analytics.filter(a => a.verification_status === 'verified')
  const rejectedSubmissions = analytics.filter(a => a.verification_status === 'rejected')
  const disputedSubmissions = analytics.filter(a => a.verification_status === 'disputed')
  
  // Handle verification action using the hook
  const handleVerification = async (id: string, status: 'verified' | 'rejected', notes: string) => {
    try {
      await updateVerificationStatus(id, status, notes)
      toast.success(`Analytics ${status} successfully`)
    } catch (error) {
      console.error('Error updating verification:', error)
      toast.error('Failed to update verification status')
    }
  }
  
  if (loading || analyticsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Campaign Analytics Review</h1>
          <p className="text-gray-600">
            Review and verify influencer campaign analytics submissions
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campaign Analytics Review</h1>
        <p className="text-gray-600">
          Review and verify influencer campaign analytics submissions
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disputed</p>
                <p className="text-2xl font-bold text-orange-600">{disputedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-blue-600">{recentActivity}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views (Verified)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalViews >= 1000000 
                    ? `${(totalViews / 1000000).toFixed(1)}M`
                    : totalViews >= 1000
                    ? `${(totalViews / 1000).toFixed(1)}K`
                    : totalViews.toString()
                  }
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalEngagement >= 1000000 
                    ? `${(totalEngagement / 1000000).toFixed(1)}M`
                    : totalEngagement >= 1000
                    ? `${(totalEngagement / 1000).toFixed(1)}K`
                    : totalEngagement.toString()
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Engagement Rate</p>
                <p className="text-2xl font-bold text-green-600">{averageEngagementRate.toFixed(2)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Platform Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
          <CardDescription>
            Analytics submissions by social media platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(platformStats).map(([platform, count]) => {
              const platformConfig = {
                instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-800' },
                youtube: { label: 'YouTube', color: 'bg-red-100 text-red-800' },
                tiktok: { label: 'TikTok', color: 'bg-black text-white' },
                twitter: { label: 'Twitter', color: 'bg-blue-100 text-blue-800' }
              }
              
              const config = platformConfig[platform as keyof typeof platformConfig] || 
                { label: platform, color: 'bg-gray-100 text-gray-800' }
              
              return (
                <div key={platform} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{count as number}</p>
                  <p className="text-sm text-gray-600">submissions</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Urgent Alerts */}
      {pendingSubmissions.length > 20 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingSubmissions.length} pending analytics submissions. 
            Consider reviewing them to maintain good response times for influencers.
          </AlertDescription>
        </Alert>
      )}
      
      {disputedSubmissions.length > 0 && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {disputedSubmissions.length} disputed analytics submissions that require immediate attention.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            {pendingSubmissions.length > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="disputed">
            Disputed
            {disputedSubmissions.length > 0 && (
              <Badge className="ml-2 bg-orange-100 text-orange-800">
                {disputedSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <div className="space-y-6">
            {pendingSubmissions.length > 0 ? (
              pendingSubmissions.map((analytic) => (
                <AnalyticsVerificationCard
                  key={analytic.id}
                  analytics={{
                    id: analytic.id,
                    platform: analytic.platform,
                    post_url: analytic.post_url,
                    post_type: analytic.post_type,
                    views_count: analytic.views_count || 0,
                    likes_count: analytic.likes_count || 0,
                    comments_count: analytic.comments_count || 0,
                    shares_count: analytic.shares_count || 0,
                    saves_count: analytic.saves_count || 0,
                    reach_count: analytic.reach || 0,
                    impressions_count: analytic.impressions || 0,
                    engagement_rate: analytic.engagement_rate || 0,
                    click_through_rate: analytic.click_through_rate || 0,
                    screenshot_urls: analytic.screenshot_url ? [analytic.screenshot_url] : [],
                    additional_notes: analytic.admin_notes || '',
                    submitted_at: analytic.created_at,
                    verification_status: analytic.verification_status,
                    verified_by: null,
                    verified_at: null,
                    verification_notes: analytic.admin_notes || null,
                    influencer: analytic.influencer?.influencer_profiles ? {
                       first_name: analytic.influencer.influencer_profiles.first_name,
                       last_name: analytic.influencer.influencer_profiles.last_name,
                       avatar_url: analytic.influencer.influencer_profiles.avatar_url || ''
                    } : undefined,
                    campaign: analytic.campaigns ? {
                      title: analytic.campaigns.title
                    } : undefined
                  }}
                  canVerify={true}
                  onVerify={handleVerification}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-gray-600">
                    No pending analytics submissions at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="disputed">
          <div className="space-y-6">
            {disputedSubmissions.length > 0 ? (
              disputedSubmissions.map((analytic) => (
                <AnalyticsVerificationCard
                  key={analytic.id}
                  analytics={{
                    id: analytic.id,
                    platform: analytic.platform,
                    post_url: analytic.post_url,
                    post_type: analytic.post_type,
                    views_count: analytic.views_count || 0,
                    likes_count: analytic.likes_count || 0,
                    comments_count: analytic.comments_count || 0,
                    shares_count: analytic.shares_count || 0,
                    saves_count: analytic.saves_count || 0,
                    reach_count: analytic.reach || 0,
                    impressions_count: analytic.impressions || 0,
                    engagement_rate: analytic.engagement_rate || 0,
                    click_through_rate: analytic.click_through_rate || 0,
                    screenshot_urls: analytic.screenshot_url ? [analytic.screenshot_url] : [],
                    additional_notes: analytic.admin_notes || '',
                    submitted_at: analytic.created_at,
                    verification_status: analytic.verification_status,
                    verified_by: null,
                    verified_at: null,
                    verification_notes: analytic.admin_notes || null,
                    influencer: analytic.influencer?.influencer_profiles ? {
                       first_name: analytic.influencer.influencer_profiles.first_name,
                       last_name: analytic.influencer.influencer_profiles.last_name,
                       avatar_url: analytic.influencer.influencer_profiles.avatar_url || ''
                    } : undefined,
                    campaign: analytic.campaigns ? {
                      title: analytic.campaigns.title
                    } : undefined
                  }}
                  canVerify={true}
                  onVerify={handleVerification}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Disputed Submissions
                  </h3>
                  <p className="text-gray-600">
                    No disputed analytics submissions at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="verified">
          <div className="space-y-6">
            {verifiedSubmissions.length > 0 ? (
              verifiedSubmissions.map((analytic) => (
                <AnalyticsVerificationCard
                  key={analytic.id}
                  analytics={{
                    id: analytic.id,
                    platform: analytic.platform,
                    post_url: analytic.post_url,
                    post_type: analytic.post_type,
                    views_count: analytic.views_count || 0,
                    likes_count: analytic.likes_count || 0,
                    comments_count: analytic.comments_count || 0,
                    shares_count: analytic.shares_count || 0,
                    saves_count: analytic.saves_count || 0,
                    reach_count: analytic.reach || 0,
                    impressions_count: analytic.impressions || 0,
                    engagement_rate: analytic.engagement_rate || 0,
                    click_through_rate: analytic.click_through_rate || 0,
                    screenshot_urls: analytic.screenshot_url ? [analytic.screenshot_url] : [],
                    additional_notes: analytic.admin_notes || '',
                    submitted_at: analytic.created_at,
                    verification_status: analytic.verification_status,
                    verified_by: null,
                    verified_at: null,
                    verification_notes: analytic.admin_notes || null,
                    influencer: analytic.influencer?.influencer_profiles ? {
                       first_name: analytic.influencer.influencer_profiles.first_name,
                       last_name: analytic.influencer.influencer_profiles.last_name,
                       avatar_url: analytic.influencer.influencer_profiles.avatar_url || ''
                    } : undefined,
                    campaign: analytic.campaigns ? {
                      title: analytic.campaigns.title
                    } : undefined
                  }}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Verified Submissions
                  </h3>
                  <p className="text-gray-600">
                    No verified analytics submissions yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="rejected">
          <div className="space-y-6">
            {rejectedSubmissions.length > 0 ? (
              rejectedSubmissions.map((analytic) => (
                <AnalyticsVerificationCard
                  key={analytic.id}
                  analytics={{
                    id: analytic.id,
                    platform: analytic.platform,
                    post_url: analytic.post_url,
                    post_type: analytic.post_type,
                    views_count: analytic.views_count || 0,
                    likes_count: analytic.likes_count || 0,
                    comments_count: analytic.comments_count || 0,
                    shares_count: analytic.shares_count || 0,
                    saves_count: analytic.saves_count || 0,
                    reach_count: analytic.reach || 0,
                    impressions_count: analytic.impressions || 0,
                    engagement_rate: analytic.engagement_rate || 0,
                    click_through_rate: analytic.click_through_rate || 0,
                    screenshot_urls: analytic.screenshot_url ? [analytic.screenshot_url] : [],
                    additional_notes: analytic.admin_notes || '',
                    submitted_at: analytic.created_at,
                    verification_status: analytic.verification_status,
                    verified_by: null,
                    verified_at: analytic.updated_at || null,
                    verification_notes: analytic.admin_notes || null,
                    influencer: analytic.influencer?.influencer_profiles ? {
                       first_name: analytic.influencer.influencer_profiles.first_name,
                       last_name: analytic.influencer.influencer_profiles.last_name,
                       avatar_url: analytic.influencer.influencer_profiles.avatar_url || ''
                    } : undefined,
                    campaign: analytic.campaigns ? {
                      title: analytic.campaigns.title
                    } : undefined
                  }}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Rejected Submissions
                  </h3>
                  <p className="text-gray-600">
                    No rejected analytics submissions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="space-y-6">
            {analytics && analytics.length > 0 ? (
              analytics.map((analytic) => (
                <AnalyticsVerificationCard
                  key={analytic.id}
                  analytics={{
                    id: analytic.id,
                    platform: analytic.platform,
                    post_url: analytic.post_url,
                    post_type: analytic.post_type,
                    views_count: analytic.views_count || 0,
                    likes_count: analytic.likes_count || 0,
                    comments_count: analytic.comments_count || 0,
                    shares_count: analytic.shares_count || 0,
                    saves_count: analytic.saves_count || 0,
                    reach_count: analytic.reach || 0,
                    impressions_count: analytic.impressions || 0,
                    engagement_rate: analytic.engagement_rate || 0,
                    click_through_rate: analytic.click_through_rate || 0,
                    screenshot_urls: analytic.screenshot_url ? [analytic.screenshot_url] : [],
                    additional_notes: analytic.admin_notes || '',
                    submitted_at: analytic.created_at,
                    verification_status: analytic.verification_status,
                    verified_by: null,
                    verified_at: analytic.updated_at || null,
                    verification_notes: analytic.admin_notes || null,
                    influencer: analytic.influencer?.influencer_profiles ? {
                       first_name: analytic.influencer.influencer_profiles.first_name,
                       last_name: analytic.influencer.influencer_profiles.last_name,
                       avatar_url: analytic.influencer.influencer_profiles.avatar_url || ''
                    } : undefined,
                    campaign: analytic.campaigns ? {
                      title: analytic.campaigns.title
                    } : undefined
                  }}
                  canVerify={analytic.verification_status === 'pending'}
                  onVerify={handleVerification}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Analytics Submissions
                  </h3>
                  <p className="text-gray-600">
                    No analytics submissions have been made yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Review Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Analytics Review Guidelines</CardTitle>
          <CardDescription>
            Guidelines for reviewing campaign analytics submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700">Verify When:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Screenshots match the reported metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Post URL is accessible and matches content</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Engagement rates seem realistic</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Metrics align with campaign requirements</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Content quality meets brand standards</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-700">Reject When:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Screenshots appear manipulated or fake</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Post URL is broken or doesn't match</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Metrics seem inflated or unrealistic</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Content doesn't meet campaign guidelines</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Insufficient or unclear documentation</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}