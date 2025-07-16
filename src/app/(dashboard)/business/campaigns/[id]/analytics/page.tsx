'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share, Users, DollarSign, Calendar, Download, ExternalLink, AlertCircle, Star, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCampaignAnalytics } from '@/hooks/useCampaignAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InfluencerReviewForm from '@/components/business/InfluencerReviewForm';
import InfluencerReviewDisplay from '@/components/business/InfluencerReviewDisplay';
import { useInfluencerReviews } from '@/hooks/useInfluencerReviews';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AnalyticsData {
  overview: {
    totalReach: number;
    totalEngagement: number;
    totalImpressions: number;
    engagementRate: number;
    costPerEngagement: number;
    roi: number;
  };
  platforms: {
    name: string;
    reach: number;
    engagement: number;
    posts: number;
    engagementRate: number;
  }[];
  demographics: {
    ageGroups: { range: string; percentage: number }[];
    genders: { type: string; percentage: number }[];
    locations: { country: string; percentage: number }[];
  };
  performance: {
    date: string;
    reach: number;
    engagement: number;
    impressions: number;
  }[];
  topPosts: {
    id: string;
    influencer: string;
    platform: string;
    content: string;
    engagement: number;
    reach: number;
    url: string;
  }[];
}

const mockAnalytics: AnalyticsData = {
  overview: {
    totalReach: 125000,
    totalEngagement: 8500,
    totalImpressions: 180000,
    engagementRate: 6.8,
    costPerEngagement: 2.35,
    roi: 320
  },
  platforms: [
    {
      name: 'Instagram',
      reach: 75000,
      engagement: 5200,
      posts: 12,
      engagementRate: 6.9
    },
    {
      name: 'TikTok',
      reach: 35000,
      engagement: 2800,
      posts: 8,
      engagementRate: 8.0
    },
    {
      name: 'YouTube',
      reach: 15000,
      engagement: 500,
      posts: 3,
      engagementRate: 3.3
    }
  ],
  demographics: {
    ageGroups: [
      { range: '18-24', percentage: 35 },
      { range: '25-34', percentage: 40 },
      { range: '35-44', percentage: 20 },
      { range: '45+', percentage: 5 }
    ],
    genders: [
      { type: 'Female', percentage: 65 },
      { type: 'Male', percentage: 32 },
      { type: 'Other', percentage: 3 }
    ],
    locations: [
      { country: 'United States', percentage: 45 },
      { country: 'United Kingdom', percentage: 20 },
      { country: 'Canada', percentage: 15 },
      { country: 'Australia', percentage: 10 },
      { country: 'Other', percentage: 10 }
    ]
  },
  performance: [
    { date: '2024-01-15', reach: 8500, engagement: 580, impressions: 12000 },
    { date: '2024-01-16', reach: 12000, engagement: 820, impressions: 16500 },
    { date: '2024-01-17', reach: 15000, engagement: 1050, impressions: 21000 },
    { date: '2024-01-18', reach: 18000, engagement: 1260, impressions: 25000 },
    { date: '2024-01-19', reach: 22000, engagement: 1540, impressions: 30000 },
    { date: '2024-01-20', reach: 25000, engagement: 1750, impressions: 35000 },
    { date: '2024-01-21', reach: 24500, engagement: 1715, impressions: 34000 }
  ],
  topPosts: [
    {
      id: '1',
      influencer: 'Sarah Johnson',
      platform: 'Instagram',
      content: 'Summer collection styling video',
      engagement: 1250,
      reach: 18500,
      url: '#'
    },
    {
      id: '2',
      influencer: 'Emma Davis',
      platform: 'TikTok',
      content: 'Product unboxing and review',
      engagement: 980,
      reach: 15200,
      url: '#'
    },
    {
      id: '3',
      influencer: 'Maya Patel',
      platform: 'Instagram',
      content: 'Behind the scenes photoshoot',
      engagement: 875,
      reach: 12800,
      url: '#'
    }
  ]
};

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { canCreateReview } = useInfluencerReviews();
  
  // Use real analytics data
  const {
    analytics: rawAnalytics,
    loading,
    error,
    stats
  } = useCampaignAnalytics({
    campaignId: params.id as string
  });
  
  // Transform raw analytics into the expected format
  const analytics: AnalyticsData = {
    overview: {
      totalReach: stats.totalReach || 0,
      totalEngagement: stats.totalEngagement || 0,
      totalImpressions: stats.totalImpressions || 0,
      engagementRate: stats.averageEngagementRate || 0,
      costPerEngagement: 0, // Calculate based on campaign budget if available
      roi: 0 // Calculate based on campaign performance
    },
    platforms: Object.entries(stats.platformBreakdown || {}).map(([name, count]) => ({
      name,
      reach: rawAnalytics.filter(a => a.platform === name).reduce((sum, a) => sum + (a.reach || 0), 0),
      engagement: rawAnalytics.filter(a => a.platform === name).reduce((sum, a) => sum + (a.likes_count + a.comments_count + a.shares_count), 0),
      posts: count,
      engagementRate: rawAnalytics.filter(a => a.platform === name).reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / count || 0
    })),
    demographics: {
      ageGroups: [],
      genders: [],
      locations: []
    },
    performance: [],
    topPosts: stats.topPerformingPosts.map(post => ({
      id: post.id,
      influencer: post.influencer ? `${post.influencer.first_name} ${post.influencer.last_name}` : 'Unknown',
      platform: post.platform,
      content: `${post.post_type} post`,
      engagement: post.likes_count + post.comments_count + post.shares_count,
      reach: post.views_count,
      url: post.post_url
    }))
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (rawAnalytics.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/business/campaigns/${params.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
              <p className="text-gray-600 mt-1">Track performance and engagement metrics</p>
            </div>
          </div>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No analytics data available yet. Influencers need to submit their campaign analytics first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getChangeIndicator = (value: number) => {
    const isPositive = value > 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(value)}%
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/business/campaigns/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
            <p className="text-gray-600 mt-1">Track performance and engagement metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reach</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalReach)}</p>
                  {getChangeIndicator(12.5)}
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Engagement</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalEngagement)}</p>
                  {getChangeIndicator(8.3)}
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Impressions</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalImpressions)}</p>
                  {getChangeIndicator(15.7)}
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold">{analytics.overview.engagementRate}%</p>
                  {getChangeIndicator(2.1)}
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost per Engagement</p>
                  <p className="text-2xl font-bold">₦{analytics.overview.costPerEngagement}</p>
                  {getChangeIndicator(-5.2)}
                </div>
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-2xl font-bold">{analytics.overview.roi}%</p>
                  {getChangeIndicator(18.9)}
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Engagement metrics by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.platforms.map((platform, index) => (
                  <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                        {platform.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-sm text-gray-600">{platform.posts} posts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(platform.engagement)}</p>
                      <p className="text-sm text-gray-600">{platform.engagementRate}% rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demographics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
              <CardDescription>Who's engaging with your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Age Groups */}
                <div>
                  <h4 className="font-medium mb-3">Age Groups</h4>
                  <div className="space-y-2">
                    {analytics.demographics.ageGroups.map((group) => (
                      <div key={group.range} className="flex items-center justify-between">
                        <span className="text-sm">{group.range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <h4 className="font-medium mb-3">Gender</h4>
                  <div className="space-y-2">
                    {analytics.demographics.genders.map((gender) => (
                      <div key={gender.type} className="flex items-center justify-between">
                        <span className="text-sm">{gender.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${gender.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{gender.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performing Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Your best content from this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{post.content}</p>
                      <p className="text-sm text-gray-600">{post.influencer} • {post.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="font-semibold">{formatNumber(post.engagement)}</p>
                      <p className="text-xs text-gray-600">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{formatNumber(post.reach)}</p>
                      <p className="text-xs text-gray-600">Reach</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Daily engagement and reach metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart visualization would be implemented here</p>
                <p className="text-sm text-gray-500">Using libraries like Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Influencer Reviews Section */}
      {rawAnalytics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Influencer Reviews
              </CardTitle>
              <CardDescription>
                Rate and review influencers who have submitted analytics for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* List of influencers with submitted analytics */}
                {Array.from(new Set(rawAnalytics.map(a => a.influencer_id))).map((influencerId) => {
                   const influencerAnalytics = rawAnalytics.filter(a => a.influencer_id === influencerId);
                   const influencer = influencerAnalytics[0]?.influencer;
                   const applicationId = influencerAnalytics[0]?.campaign_id; // Use campaign_id as fallback
                   
                   if (!influencer) return null;
                   
                   // Access influencer data correctly based on the data structure
                    const firstName = influencer.influencer_profiles?.first_name || 'Unknown';
                    const lastName = influencer.influencer_profiles?.last_name || 'User';
                   
                   return (
                     <div key={influencerId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                           {firstName[0]}{lastName[0]}
                         </div>
                         <div>
                           <p className="font-medium">
                             {firstName} {lastName}
                           </p>
                           <p className="text-sm text-gray-600">
                             {influencerAnalytics.length} analytics submitted
                           </p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setSelectedInfluencer({ 
                             id: influencerId, 
                             first_name: firstName, 
                             last_name: lastName,
                             applicationId: applicationId || params.id 
                           })}
                         >
                           <Eye className="w-4 h-4 mr-2" />
                           View Reviews
                         </Button>
                         <Button
                           size="sm"
                           onClick={() => {
                             setSelectedInfluencer({ 
                               id: influencerId, 
                               first_name: firstName, 
                               last_name: lastName,
                               applicationId: applicationId || params.id 
                             });
                             setShowReviewForm(true);
                           }}
                         >
                           <Star className="w-4 h-4 mr-2" />
                           Write Review
                         </Button>
                       </div>
                     </div>
                   );
                 })}
                
                {Array.from(new Set(rawAnalytics.map(a => a.influencer_id))).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No analytics submitted yet</p>
                    <p className="text-sm mt-1">Reviews will appear here once influencers submit their analytics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Write Review</DialogTitle>
          </DialogHeader>
          {selectedInfluencer && (
            <InfluencerReviewForm
              campaignId={params.id as string}
              influencerId={selectedInfluencer.id}
              applicationId={selectedInfluencer.applicationId}
              influencerName={`${selectedInfluencer.first_name} ${selectedInfluencer.last_name}`}
              campaignTitle="Campaign" // You might want to fetch the actual campaign title
              onSuccess={() => {
                setShowReviewForm(false);
                setSelectedInfluencer(null);
              }}
              onCancel={() => {
                setShowReviewForm(false);
                setSelectedInfluencer(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Review Display Dialog */}
      <Dialog open={!!selectedInfluencer && !showReviewForm} onOpenChange={(open) => !open && setSelectedInfluencer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Reviews for {selectedInfluencer?.first_name} {selectedInfluencer?.last_name}
            </DialogTitle>
          </DialogHeader>
          {selectedInfluencer && (
            <InfluencerReviewDisplay
              influencerId={selectedInfluencer.id}
              showCreateButton={true}
              onCreateReview={() => setShowReviewForm(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}