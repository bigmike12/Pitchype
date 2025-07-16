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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  Calendar,
  Eye,
  Users,
  DollarSign,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function BusinessAnalyticsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [businessProfile, setBusinessProfile] = useState<any>(null)
  const supabase = createClient()
  
  // Use the campaign analytics hook
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    stats,
    refetch: refetchAnalytics
  } = useCampaignAnalytics({ 
    businessId: user?.id,
    verificationStatus: 'verified'
  })
  
  if (loading || analyticsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }
  
  if (!user || userProfile?.user_role !== 'business') {
    return null
  }
  
  // Use stats from the hook
  const {
    total: totalAnalytics,
    totalViews,
    totalEngagement,
    totalReach,
    totalImpressions,
    averageEngagementRate,
    averageCTR,
    platformBreakdown: platformStats,
    postTypeBreakdown: postTypeStats,
    topPerformingPosts: topPosts
  } = stats
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campaign Analytics</h1>
        <p className="text-gray-600">
          View performance data from your verified campaign analytics
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(totalViews)}</p>
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
                <p className="text-2xl font-bold text-purple-600">{formatNumber(totalEngagement)}</p>
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
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
                <p className="text-2xl font-bold text-orange-600">{averageCTR.toFixed(2)}%</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold text-indigo-600">{formatNumber(totalReach)}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-pink-600">{formatNumber(totalImpressions)}</p>
              </div>
              <Eye className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Analytics Reports</p>
                <p className="text-2xl font-bold text-gray-900">{totalAnalytics}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Platform & Content Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>
              Analytics breakdown by social media platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(platformStats).map(([platform, count]) => {
                const platformConfig = {
                  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-800' },
                  youtube: { label: 'YouTube', color: 'bg-red-100 text-red-800' },
                  tiktok: { label: 'TikTok', color: 'bg-black text-white' },
                  twitter: { label: 'Twitter', color: 'bg-blue-100 text-blue-800' }
                }
                
                const config = platformConfig[platform as keyof typeof platformConfig] || 
                  { label: platform, color: 'bg-gray-100 text-gray-800' }
                
                const countNum = count as number
                const percentage = totalAnalytics > 0 ? ((countNum / totalAnalytics) * 100).toFixed(1) : '0'
                
                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                      <span className="text-sm text-gray-600">{countNum} posts</span>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Type Performance</CardTitle>
            <CardDescription>
              Analytics breakdown by post type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(postTypeStats).map(([type, count]) => {
                const typeConfig = {
                  post: { label: 'Regular Post', color: 'bg-blue-100 text-blue-800' },
                  story: { label: 'Story', color: 'bg-purple-100 text-purple-800' },
                  reel: { label: 'Reel/Short', color: 'bg-green-100 text-green-800' },
                  video: { label: 'Video', color: 'bg-red-100 text-red-800' },
                  live: { label: 'Live Stream', color: 'bg-orange-100 text-orange-800' }
                }
                
                const config = typeConfig[type as keyof typeof typeConfig] || 
                  { label: type, color: 'bg-gray-100 text-gray-800' }
                
                const countNum = count as number
                const percentage = totalAnalytics > 0 ? ((countNum / totalAnalytics) * 100).toFixed(1) : '0'
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                      <span className="text-sm text-gray-600">{countNum} posts</span>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Performing Posts */}
      {topPosts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>
              Your highest engagement rate posts from recent campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post: any, index: number) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {post.profiles?.influencer_profiles?.first_name} {post.profiles?.influencer_profiles?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {post.platform} • {post.post_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {post.engagement_rate?.toFixed(2)}% engagement
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatNumber(post.views_count || 0)} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by influencer name or campaign..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns?.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Analytics List */}
      <div className="space-y-6">
        {analytics && analytics.length > 0 ? (
          analytics.map((analytic) => (
            <AnalyticsVerificationCard
              key={analytic.id}
              analytics={{
                ...analytic,
                screenshot_urls: analytic.screenshot_url ? [analytic.screenshot_url] : [],
                additional_notes: analytic.admin_notes || '',
                submitted_at: analytic.created_at,
                reach_count: analytic.reach || 0,
                impressions_count: analytic.impressions || 0,
                saves_count: analytic.saves_count || 0,
                click_through_rate: analytic.click_through_rate || 0,
                verified_at: null,
                verified_by: null,
                verification_notes: analytic.admin_notes || null,
                influencer: analytic.influencer_profiles ? {
                   first_name: analytic.influencer_profiles?.first_name || '',
                   last_name: analytic.influencer_profiles?.last_name || '',
                  avatar_url: analytic.influencer_profiles.avatar_url || ''
                } : undefined,
                campaign: analytic.campaigns ? {
                  title: analytic.campaigns.title
                } : undefined
              }}
              canVerify={false}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Analytics Data
              </h3>
              <p className="text-gray-600 mb-4">
                No verified analytics submissions for your campaigns yet.
              </p>
              <p className="text-sm text-gray-500">
                Analytics will appear here once influencers submit campaign data and it gets verified.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Analytics Insights */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Analytics Insights</CardTitle>
          <CardDescription>
            Key insights from your campaign performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700">Performance Highlights</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Average engagement rate: {averageEngagementRate.toFixed(2)}%</span>
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span>Total campaign reach: {formatNumber(totalReach)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Total impressions: {formatNumber(totalImpressions)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  <span>Average CTR: {averageCTR.toFixed(2)}%</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-blue-700">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Focus on high-performing platforms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Collaborate with top-performing influencers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Optimize content types based on engagement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Monitor campaign performance regularly</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}