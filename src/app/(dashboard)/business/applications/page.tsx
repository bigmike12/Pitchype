'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Users, TrendingUp, Star, Instagram, Youtube, Twitter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useApplications } from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicationApproval } from '@/components/business/ApplicationApproval';
import { toast } from 'sonner';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface Application {
  id: string;
  influencer: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    followers: number;
    engagementRate: number;
    platforms: string[];
    rating: number;
    verified: boolean;
  };
  campaign: {
    id: string;
    title: string;
    budget: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  message: string;
  proposedRate: number;
  deliverables: string[];
}

const mockApplications: Application[] = [
  {
    id: '1',
    influencer: {
      id: '1',
      name: 'Sarah Johnson',
      username: '@sarahjstyle',
      avatar: '/api/placeholder/40/40',
      followers: 125000,
      engagementRate: 4.2,
      platforms: ['Instagram', 'TikTok'],
      rating: 4.8,
      verified: true
    },
    campaign: {
      id: '1',
      title: 'Summer Collection Launch',
      budget: 5000
    },
    status: 'pending',
    appliedAt: '2024-01-22T10:30:00Z',
    message: 'I love your brand aesthetic and would be excited to create authentic content showcasing your summer collection. My audience aligns perfectly with your target demographic.',
    proposedRate: 800,
    deliverables: ['2 Instagram posts', '1 Instagram story', '1 TikTok video']
  },
  {
    id: '2',
    influencer: {
      id: '2',
      name: 'Emma Davis',
      username: '@emmafashion',
      avatar: '/api/placeholder/40/40',
      followers: 89000,
      engagementRate: 5.1,
      platforms: ['Instagram', 'YouTube'],
      rating: 4.6,
      verified: false
    },
    campaign: {
      id: '2',
      title: 'Fitness Gear Campaign',
      budget: 3000
    },
    status: 'approved',
    appliedAt: '2024-01-20T14:15:00Z',
    message: 'As a fitness enthusiast, I would love to showcase your gear in my workout routines. I can create engaging content that demonstrates the products in action.',
    proposedRate: 600,
    deliverables: ['1 YouTube video', '3 Instagram posts', '5 Instagram stories']
  },
  {
    id: '3',
    influencer: {
      id: '3',
      name: 'Maya Patel',
      username: '@mayastyle',
      avatar: '/api/placeholder/40/40',
      followers: 67000,
      engagementRate: 6.3,
      platforms: ['TikTok', 'Instagram'],
      rating: 4.9,
      verified: true
    },
    campaign: {
      id: '1',
      title: 'Summer Collection Launch',
      budget: 5000
    },
    status: 'rejected',
    appliedAt: '2024-01-19T09:45:00Z',
    message: 'I specialize in lifestyle and fashion content. Your summer collection would fit perfectly with my content style and engaged audience.',
    proposedRate: 750,
    deliverables: ['3 TikTok videos', '2 Instagram posts', '1 Instagram reel']
  },
  {
    id: '4',
    influencer: {
      id: '4',
      name: 'Alex Chen',
      username: '@alextech',
      avatar: '/api/placeholder/40/40',
      followers: 156000,
      engagementRate: 3.8,
      platforms: ['YouTube', 'Twitter'],
      rating: 4.7,
      verified: true
    },
    campaign: {
      id: '3',
      title: 'Tech Product Review',
      budget: 8000
    },
    status: 'pending',
    appliedAt: '2024-01-21T16:20:00Z',
    message: 'I have extensive experience reviewing tech products and would provide an honest, detailed review that helps your audience make informed decisions.',
    proposedRate: 1200,
    deliverables: ['1 YouTube review video', '1 Twitter thread', '3 Instagram posts']
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const platformIcons = {
  Instagram: Instagram,
  TikTok: Users,
  YouTube: Youtube,
  Twitter: Twitter
};

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  const { user } = useAuth();
  
  const { 
    applications, 
    loading, 
    error, 
    updateApplication 
  } = useApplications({ 
    businessId: user?.id,
    status: statusFilter === "all" ? undefined : statusFilter 
  });

  const filteredApplications = applications.filter(application => {
    const influencer = application.influencer;
    const influencerName = influencer ? `${influencer.first_name || ''} ${influencer.last_name || ''}`.trim() : '';
    const campaignTitle = application.campaign?.title || '';
    
    const matchesSearch = influencerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaignTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampaign = campaignFilter === 'all' || application.campaign?.id === campaignFilter;
    return matchesSearch && matchesCampaign;
  });

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    try {
      await updateApplication(applicationId, { status });
      toast.success(`Application ${status} successfully`);
    } catch (error) {
      toast.error(`Failed to ${status} application`);
    }
  };



  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Filters skeleton */}
        <div className="flex items-center space-x-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Applications grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
                
                <div className="flex items-center justify-between pt-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  };

  const getUniqueCampaigns = () => {
    const campaigns = applications.reduce((acc, app) => {
      if (app.campaign?.id && !acc.find(c => c.id === app.campaign?.id)) {
        acc.push(app.campaign);
      }
      return acc;
    }, [] as { id: string; title: string }[]);
    return campaigns;
  };

  const statusCounts = getStatusCounts();
  const campaigns = getUniqueCampaigns();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-1">Manage influencer applications across all campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{statusCounts.all}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by influencer name, username, or campaign..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map(campaign => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application, index) => {
          return (
            <MotionDiv
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ApplicationApproval
                application={application as any}
                onStatusUpdate={handleUpdateStatus}
              />
            </MotionDiv>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || campaignFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Applications from influencers will appear here'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}