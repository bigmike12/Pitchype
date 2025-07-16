'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/client'
import { useCampaignAnalytics } from '@/hooks/useCampaignAnalytics'
import AnalyticsSubmissionForm from '@/components/campaign-analytics/AnalyticsSubmissionForm'
import AnalyticsVerificationCard from '@/components/campaign-analytics/AnalyticsVerificationCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function InfluencerAnalyticsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const supabase = createClient()
  
  // Use the campaign analytics hook
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    stats,
    refetch: refetchAnalytics
  } = useCampaignAnalytics({ influencerId: user?.id })
  
  if (loading || analyticsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }
  
  if (!user || userProfile?.user_role !== 'influencer') {
    return null
  }
  
  const availableApplications = applications
  
  // Use stats from the hook
  const {
    total: totalSubmissions,
    pending: pendingSubmissions,
    verified: verifiedSubmissions,
    rejected: rejectedSubmissions,
    totalViews,
    totalEngagement,
    averageEngagementRate
  } = stats

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campaign Analytics</h1>
        <p className="text-gray-600">
          Submit and track your campaign performance metrics
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{totalSubmissions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingSubmissions}</p>
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
                <p className="text-2xl font-bold text-green-600">{verifiedSubmissions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                <p className="text-2xl font-bold text-purple-600">{averageEngagementRate.toFixed(2)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submit">Submit Analytics</TabsTrigger>
          <TabsTrigger value="submissions">
            My Submissions
            {stats.pending > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit Campaign Analytics</CardTitle>
              <CardDescription>
                Upload your campaign performance data for business verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableApplications.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 mb-4">
                    Select a campaign to submit analytics for:
                  </div>
                  <div className="grid gap-4">
                    {availableApplications.map((application) => (
                      <Card key={application.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {(application.campaigns as any)?.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {(application.campaigns as any)?.business_profiles?.company_name}
                              </p>
                            </div>
                            <Badge variant="outline">Accepted</Badge>
                          </div>
                          <AnalyticsSubmissionForm 
                            applicationId={application.id}
                            campaignId={(application.campaigns as any)?.id || ''}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Active Campaigns
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You need to have accepted campaign applications to submit analytics.
                  </p>
                  <a
                    href="/influencer/campaigns"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Browse Available Campaigns →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="submissions">
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
                    views_count: analytic.views_count,
                    likes_count: analytic.likes_count,
                    comments_count: analytic.comments_count,
                    shares_count: analytic.shares_count,
                    saves_count: analytic.saves_count || 0,
                    reach_count: analytic.reach || 0,
                    impressions_count: analytic.impressions || 0,
                    engagement_rate: analytic.engagement_rate,
                    click_through_rate: analytic.click_through_rate || 0,
                          screenshot_urls: analytic.screenshot_url ? [analytic.screenshot_url] : [],
                          additional_notes: analytic.admin_notes || '',
                          submitted_at: analytic.created_at,
                          verification_status: analytic.verification_status,
                          verified_by: null,
                          verified_at: null,
                          verification_notes: analytic.admin_notes || null,
                    campaign: analytic.campaigns ? { title: analytic.campaigns.title } : undefined
                  }}
                  canVerify={false}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Analytics Submitted Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by submitting analytics for your completed campaigns.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}