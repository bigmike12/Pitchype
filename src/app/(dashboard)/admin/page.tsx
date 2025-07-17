'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building2, Target, DollarSign, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Clock, Eye, MessageSquare, Star, Calendar, Download, BarChart3, PieChart, UserCheck, UserX, Zap } from 'lucide-react';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalBusinesses: number;
    totalInfluencers: number;
    activeCampaigns: number;
    totalRevenue: number;
    monthlyGrowth: number;
    platformCommission: number;
    pendingApprovals: number;
  };
  userMetrics: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    userRetentionRate: number;
    averageSessionDuration: string;
    mostActiveRegion: string;
  };
  campaignMetrics: {
    campaignsCreatedToday: number;
    campaignsCompletedToday: number;
    averageCampaignValue: number;
    successRate: number;
    topCategory: string;
    totalReach: number;
  };
  financialMetrics: {
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    averageTransactionValue: number;
    pendingPayments: number;
    disputedPayments: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'campaign_created' | 'campaign_completed' | 'payment_processed' | 'dispute_raised' | 'verification_request';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    type: 'business' | 'influencer';
  };
  amount?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
}

interface TopPerformer {
  id: string;
  name: string;
  type: 'business' | 'influencer';
  metric: string;
  value: number;
  growth: number;
  avatar?: string;
}

const mockStats: AdminStats = {
  overview: {
    totalUsers: 15420,
    totalBusinesses: 3240,
    totalInfluencers: 12180,
    activeCampaigns: 1250,
    totalRevenue: 2450000,
    monthlyGrowth: 18.5,
    platformCommission: 245000,
    pendingApprovals: 45
  },
  userMetrics: {
    newUsersToday: 127,
    newUsersThisWeek: 892,
    newUsersThisMonth: 3420,
    userRetentionRate: 78.5,
    averageSessionDuration: '12m 34s',
    mostActiveRegion: 'North America'
  },
  campaignMetrics: {
    campaignsCreatedToday: 23,
    campaignsCompletedToday: 18,
    averageCampaignValue: 1850,
    successRate: 89.2,
    topCategory: 'Fashion',
    totalReach: 45600000
  },
  financialMetrics: {
    revenueToday: 28500,
    revenueThisWeek: 185000,
    revenueThisMonth: 720000,
    averageTransactionValue: 1250,
    pendingPayments: 15,
    disputedPayments: 3
  }
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'campaign_created',
    title: 'New Campaign Created',
    description: 'StyleCorp launched "Summer Fashion Collection" campaign',
    timestamp: '2024-02-01T14:30:00Z',
    user: { name: 'StyleCorp', type: 'business' },
    amount: 5000,
    status: 'pending'
  },
  {
    id: '2',
    type: 'user_signup',
    title: 'New Influencer Joined',
    description: 'Alex Johnson signed up as a fashion influencer',
    timestamp: '2024-02-01T13:45:00Z',
    user: { name: 'Alex Johnson', type: 'influencer' }
  },
  {
    id: '3',
    type: 'payment_processed',
    title: 'Payment Processed',
    description: 'Payment of ₦1,200 processed for TechNova campaign',
    timestamp: '2024-02-01T12:20:00Z',
    amount: 1200,
    status: 'completed'
  },
  {
    id: '4',
    type: 'verification_request',
    title: 'Verification Request',
    description: 'FitTech requested business verification',
    timestamp: '2024-02-01T11:15:00Z',
    user: { name: 'FitTech', type: 'business' },
    status: 'pending'
  },
  {
    id: '5',
    type: 'campaign_completed',
    title: 'Campaign Completed',
    description: 'QuickEats food delivery promotion campaign finished',
    timestamp: '2024-02-01T10:30:00Z',
    user: { name: 'QuickEats', type: 'business' },
    amount: 2500,
    status: 'completed'
  },
  {
    id: '6',
    type: 'dispute_raised',
    title: 'Payment Dispute',
    description: 'Dispute raised for BeautyBrand campaign payment',
    timestamp: '2024-02-01T09:45:00Z',
    amount: 800,
    status: 'pending'
  }
];

const mockTopPerformers: TopPerformer[] = [
  {
    id: '1',
    name: 'StyleCorp',
    type: 'business',
    metric: 'Total Spent',
    value: 45000,
    growth: 25.5
  },
  {
    id: '2',
    name: 'Emma Wilson',
    type: 'influencer',
    metric: 'Total Earnings',
    value: 28500,
    growth: 18.2
  },
  {
    id: '3',
    name: 'TechNova',
    type: 'business',
    metric: 'Campaigns Created',
    value: 15,
    growth: 12.8
  },
  {
    id: '4',
    name: 'Alex Johnson',
    type: 'influencer',
    metric: 'Engagement Rate',
    value: 8.9,
    growth: 15.3
  },
  {
    id: '5',
    name: 'FitTech',
    type: 'business',
    metric: 'ROI',
    value: 285,
    growth: 22.1
  }
];

export default function AdminDashboard() {
  const [stats] = useState<AdminStats>(mockStats);
  const [recentActivity] = useState<RecentActivity[]>(mockRecentActivity);
  const [topPerformers] = useState<TopPerformer[]>(mockTopPerformers);
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'last_year', label: 'Last Year' }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthIndicator = (rate: number) => {
    const isPositive = rate > 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(rate)}%
      </div>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'campaign_created': return <Target className="w-4 h-4 text-blue-500" />;
      case 'campaign_completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'payment_processed': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'dispute_raised': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'verification_request': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.overview.totalUsers)}</p>
                  <p className="text-xs text-gray-600">
                    {formatNumber(stats.overview.totalBusinesses)} businesses • {formatNumber(stats.overview.totalInfluencers)} influencers
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.overview.activeCampaigns)}</p>
                  <p className="text-xs text-gray-600">
                    {stats.campaignMetrics.campaignsCreatedToday} created today
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.overview.totalRevenue)}</p>
                  {getGrowthIndicator(stats.overview.monthlyGrowth)}
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Platform Commission</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.overview.platformCommission)}</p>
                  <p className="text-xs text-gray-600">
                    {stats.overview.pendingApprovals} pending approvals
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Metrics */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>User Metrics</CardTitle>
              <CardDescription>User growth and engagement statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">New Today</p>
                  <p className="text-xl font-bold">{stats.userMetrics.newUsersToday}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-xl font-bold">{formatNumber(stats.userMetrics.newUsersThisWeek)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-bold">{formatNumber(stats.userMetrics.newUsersThisMonth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Retention Rate</p>
                  <p className="text-xl font-bold">{stats.userMetrics.userRetentionRate}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avg Session Duration</span>
                  <span className="font-medium">{stats.userMetrics.averageSessionDuration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Most Active Region</span>
                  <span className="font-medium">{stats.userMetrics.mostActiveRegion}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        {/* Campaign Metrics */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Campaign Metrics</CardTitle>
              <CardDescription>Campaign performance and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Created Today</p>
                  <p className="text-xl font-bold">{stats.campaignMetrics.campaignsCreatedToday}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-xl font-bold">{stats.campaignMetrics.campaignsCompletedToday}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Value</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.campaignMetrics.averageCampaignValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-xl font-bold">{stats.campaignMetrics.successRate}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Top Category</span>
                  <span className="font-medium">{stats.campaignMetrics.topCategory}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Reach</span>
                  <span className="font-medium">{formatNumber(stats.campaignMetrics.totalReach)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        {/* Financial Metrics */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
              <CardDescription>Revenue and payment statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.financialMetrics.revenueToday)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.financialMetrics.revenueThisWeek)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.financialMetrics.revenueThisMonth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Transaction</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.financialMetrics.averageTransactionValue)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending Payments</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {stats.financialMetrics.pendingPayments}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Disputed Payments</span>
                  <Badge className="bg-red-100 text-red-800">
                    {stats.financialMetrics.disputedPayments}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <MotionDiv
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-2">
                        {activity.user && (
                          <Badge variant="outline" className="text-xs">
                            {activity.user.name}
                          </Badge>
                        )}
                        {activity.amount && (
                          <Badge variant="outline" className="text-xs">
                            {formatCurrency(activity.amount)}
                          </Badge>
                        )}
                        {activity.status && (
                          <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        {/* Top Performers */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Leading businesses and influencers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <MotionDiv
                    key={performer.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                        {performer.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{performer.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {performer.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{performer.metric}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {performer.metric.includes('$') || performer.metric.includes('Spent') || performer.metric.includes('Earnings')
                          ? formatCurrency(performer.value)
                          : performer.metric.includes('Rate')
                          ? `${performer.value}%`
                          : formatNumber(performer.value)
                        }
                      </p>
                      {getGrowthIndicator(performer.growth)}
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      {/* Charts Placeholder */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Visual representation of platform performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive analytics charts would be implemented here</p>
                <p className="text-sm text-gray-500">Using libraries like Chart.js, Recharts, or D3.js</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>

      {/* Quick Actions */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="w-6 h-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Target className="w-6 h-6" />
                <span className="text-sm">Review Campaigns</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <DollarSign className="w-6 h-6" />
                <span className="text-sm">Process Payments</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-sm">Handle Disputes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}