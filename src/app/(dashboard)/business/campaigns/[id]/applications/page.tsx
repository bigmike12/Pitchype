'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, MessageSquare, CheckCircle, Clock, XCircle, Eye, Star, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface Application {
  id: string;
  influencer: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    followers: number;
    engagement: number;
    rating: number;
    completedCampaigns: number;
    niche: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  proposal: string;
  rate: number;
  estimatedReach: number;
  portfolio: {
    posts: number;
    avgLikes: number;
    avgComments: number;
  };
}

const mockApplications: Application[] = [
  {
    id: '1',
    influencer: {
      id: '1',
      name: 'Sarah Johnson',
      username: '@sarahjstyle',
      avatar: '/api/placeholder/40/40',
      followers: 25000,
      engagement: 4.2,
      rating: 4.8,
      completedCampaigns: 12,
      niche: ['Fashion', 'Lifestyle']
    },
    status: 'approved',
    appliedAt: '2024-01-10T10:30:00Z',
    proposal: 'I love your summer collection! I can create authentic lifestyle content that showcases the pieces in natural settings. My audience is primarily young women who are interested in affordable fashion.',
    rate: 500,
    estimatedReach: 15000,
    portfolio: {
      posts: 156,
      avgLikes: 1200,
      avgComments: 45
    }
  },
  {
    id: '2',
    influencer: {
      id: '2',
      name: 'Emma Davis',
      username: '@emmafashion',
      avatar: '/api/placeholder/40/40',
      followers: 18000,
      engagement: 3.8,
      rating: 4.6,
      completedCampaigns: 8,
      niche: ['Fashion', 'Beauty']
    },
    status: 'pending',
    appliedAt: '2024-01-12T14:15:00Z',
    proposal: 'Your brand aligns perfectly with my aesthetic. I can create high-quality content for Instagram and TikTok that will resonate with my engaged audience.',
    rate: 400,
    estimatedReach: 12000,
    portfolio: {
      posts: 89,
      avgLikes: 850,
      avgComments: 32
    }
  },
  {
    id: '3',
    influencer: {
      id: '3',
      name: 'Lisa Chen',
      username: '@lisastyle',
      avatar: '/api/placeholder/40/40',
      followers: 32000,
      engagement: 5.1,
      rating: 4.9,
      completedCampaigns: 20,
      niche: ['Fashion', 'Travel', 'Lifestyle']
    },
    status: 'rejected',
    appliedAt: '2024-01-08T09:45:00Z',
    proposal: 'I would love to collaborate and showcase your summer pieces to my engaged audience. I have experience with fashion brands and can deliver high-quality content.',
    rate: 600,
    estimatedReach: 20000,
    portfolio: {
      posts: 234,
      avgLikes: 1800,
      avgComments: 78
    }
  },
  {
    id: '4',
    influencer: {
      id: '4',
      name: 'Maya Patel',
      username: '@mayastyle',
      avatar: '/api/placeholder/40/40',
      followers: 15000,
      engagement: 4.5,
      rating: 4.7,
      completedCampaigns: 6,
      niche: ['Fashion', 'Fitness']
    },
    status: 'pending',
    appliedAt: '2024-01-13T16:20:00Z',
    proposal: 'I am excited about your summer collection and would love to create content that shows how these pieces can be styled for different occasions.',
    rate: 350,
    estimatedReach: 10000,
    portfolio: {
      posts: 67,
      avgLikes: 720,
      avgComments: 28
    }
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle
};

export default function CampaignApplicationsPage() {
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.influencer.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (applicationId: string, newStatus: 'approved' | 'rejected') => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ));
  };

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/business/campaigns/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage influencer applications</p>
        </div>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
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
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application, index) => {
          const StatusIcon = statusIcons[application.status];
          return (
            <MotionDiv
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={application.influencer.avatar} />
                        <AvatarFallback>{application.influencer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{application.influencer.name}</h3>
                          <span className="text-gray-500">{application.influencer.username}</span>
                          <Badge className={statusColors[application.status]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {application.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            {application.influencer.followers.toLocaleString()} followers
                          </div>
                          <div className="flex items-center text-gray-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {application.influencer.engagement}% engagement
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Star className="w-4 h-4 mr-1" />
                            {application.influencer.rating} rating
                          </div>
                          <div className="text-gray-600">
                            ₦{application.rate} rate
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {application.influencer.niche.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2">{application.proposal}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                          <span>Est. reach: {application.estimatedReach.toLocaleString()}</span>
                          <span>{application.influencer.completedCampaigns} campaigns completed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                            <DialogDescription>
                              Review {application.influencer.name}'s application
                            </DialogDescription>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={selectedApplication.influencer.avatar} />
                                  <AvatarFallback>{selectedApplication.influencer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-semibold">{selectedApplication.influencer.name}</h3>
                                  <p className="text-gray-600">{selectedApplication.influencer.username}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm">{selectedApplication.influencer.rating} ({selectedApplication.influencer.completedCampaigns} campaigns)</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                  <p className="text-2xl font-bold">{selectedApplication.influencer.followers.toLocaleString()}</p>
                                  <p className="text-sm text-gray-600">Followers</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                  <p className="text-2xl font-bold">{selectedApplication.influencer.engagement}%</p>
                                  <p className="text-sm text-gray-600">Engagement</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                  <p className="text-2xl font-bold">₦{selectedApplication.rate}</p>
                                  <p className="text-sm text-gray-600">Rate</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Proposal</h4>
                                <p className="text-gray-600">{selectedApplication.proposal}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Portfolio Stats</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium">{selectedApplication.portfolio.posts}</p>
                                    <p className="text-gray-600">Posts</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">{selectedApplication.portfolio.avgLikes}</p>
                                    <p className="text-gray-600">Avg Likes</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">{selectedApplication.portfolio.avgComments}</p>
                                    <p className="text-gray-600">Avg Comments</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {application.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(application.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No influencers have applied to this campaign yet'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}