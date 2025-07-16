'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Users, Calendar, DollarSign, Eye, MessageSquare, CheckCircle, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/hooks/useCampaigns';
import { useApplications } from '@/hooks/useApplications';
import { Database } from '@/types/database';

type Campaign = Database['public']['Tables']['campaigns']['Row'] & {
  business?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
  };
  applications?: Array<{
    id: string;
    status: string;
    influencer?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    };
  }>;
};

type Application = Database['public']['Tables']['applications']['Row'] & {
  campaign?: {
    id: string;
    title: string;
    description: string | null;
    budget_min: number | null;
    budget_max: number | null;
    status: string;
    business?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      company_name: string | null;
      avatar_url: string | null;
    };
  };
  influencer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    social_links: any;
  };
};

// const mockCampaign: Campaign = {
//   id: '1',
//   title: 'Summer Fashion Collection',
//   description: 'Promote our new summer collection with lifestyle content that showcases the versatility and style of our pieces.',
//   budget_min: 4000,
//   budget_max: 6000,
//   status: 'active',
//   applications: 24,
//   approved: 8,
//   submissions: 5,
//   start_date: '2024-01-15',
//   end_date: '2024-02-15',
//   category: 'Fashion',
//   platforms: ['Instagram', 'TikTok'],
//   deliverables: ['Instagram Post', 'Instagram Story', 'TikTok Video'],
//   requirements: ['Minimum 10K followers', 'Fashion/Lifestyle niche', 'High engagement rate'],
//   target_audience: 'Women aged 18-35 interested in fashion and lifestyle',
//   guidelines: 'Content should be bright and summery. Please tag @ourbrand and use #SummerVibes. Avoid overly edited photos.',
//   required_influencers: 10
// };

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

const applicationStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-gray-100 text-gray-800',
  submitted: 'bg-purple-100 text-purple-800',
  revision_requested: 'bg-orange-100 text-orange-800'
};

const applicationStatusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  completed: CheckCircle,
  withdrawn: XCircle,
  submitted: MessageSquare,
  revision_requested: AlertCircle
};

export default function CampaignDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  
  // Use hooks for data fetching
  const {
    campaign,
    loading,
    error: campaignError
  } = useCampaign(params.id as string);
  
  const {
    applications,
    loading: applicationsLoading,
    error: applicationsError
  } = useApplications({ campaignId: params.id as string });
  
  // Handle errors
  useEffect(() => {
    if (campaignError) {
      console.error('Error fetching campaign:', campaignError);
      toast.error('Failed to load campaign details');
    }
  }, [campaignError]);
  
  useEffect(() => {
    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      toast.error('Failed to load applications');
    }
  }, [applicationsError]);

  const progress = campaign?.end_date && campaign?.start_date ? 
    Math.min(100, ((new Date().getTime() - new Date(campaign.start_date).getTime()) / 
    (new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime())) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
          <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/business/campaigns">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/business/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
              <Badge className={statusColors[campaign.status] || 'bg-gray-100 text-gray-800'}>
                {campaign.status}
              </Badge>
            </div>
            {/* Category field may not exist in database schema */}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/business/campaigns/${campaign.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href={`/business/campaigns/${campaign.id}/analytics`}>
            <Button className="bg-green-600 hover:bg-green-700">
              <Eye className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-2xl font-bold">₦{campaign?.budget_min?.toLocaleString() || 0} - ₦{campaign?.budget_max?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold">{applications?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{applications?.filter(app => app.status === 'approved').length || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submissions</p>
                <p className="text-2xl font-bold">{applications?.filter(app => app.status === 'submitted' || app.status === 'completed').length || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Campaign Progress</h3>
              <span className="text-sm text-gray-600">
                {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'TBD'} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'TBD'}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600">{Math.round(progress)}% complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications?.length || 0})</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({applications?.filter(app => app.status === 'submitted' || app.status === 'completed').length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{campaign.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Target Audience</h4>
                  <p className="text-gray-600">{campaign.target_audience || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(campaign.platforms) && campaign.platforms.length > 0 ? (
                      campaign.platforms.map(platform => (
                        <Badge key={platform} variant="secondary">{platform}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">No platforms specified</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Deliverables</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(campaign.deliverables) && campaign.deliverables.length > 0 ? (
                      campaign.deliverables.map(deliverable => (
                        <Badge key={deliverable} variant="outline">{deliverable}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">No deliverables specified</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements & Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {Array.isArray(campaign.requirements) && campaign.requirements.length > 0 ? (
                      campaign.requirements.map((req, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No requirements specified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Content Guidelines</h4>
                  <p className="text-gray-600">{campaign.guidelines || 'No guidelines provided'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Applications</h3>
            <Link href={`/business/campaigns/${campaign.id}/applications`}>
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {applications?.map((application, index) => {
              const StatusIcon = applicationStatusIcons[application.status] || Clock;
              const influencer = application.influencer;
              const fullName = influencer ? `${influencer.first_name || ''} ${influencer.last_name || ''}`.trim() || 'Unknown' : 'Unknown';
              const handle = influencer ? 'user' : 'unknown'; // Social handles not available in current schema
              
              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={influencer?.avatar_url || ''} />
                            <AvatarFallback>{fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{fullName}</h4>
                              <span className="text-gray-500">@{handle}</span>
                              <Badge className={applicationStatusColors[application.status] || 'bg-gray-100 text-gray-800'}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {application.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span>Influencer metrics</span>
                              <span>₦{application.proposed_rate || 0}</span>
                              <span>{application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <p className="text-gray-600">{application.proposal}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {application.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                              <Button size="sm" variant="outline">Reject</Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Content Submissions</h3>
            <Link href={`/business/campaigns/${campaign.id}/submissions`}>
              <Button>View All Submissions</Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">View Detailed Submissions</h3>
              <p className="text-gray-600 mb-4">Click the button above to review and manage all content submissions for this campaign.</p>
              <Link href={`/business/campaigns/${campaign.id}/submissions`}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Eye className="w-4 h-4 mr-2" />
                  Review Submissions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}