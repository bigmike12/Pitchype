'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, MoreHorizontal, Eye, Edit, Ban, CheckCircle, XCircle, Target, DollarSign, Calendar, Users, Building2, Star, AlertTriangle, Clock, TrendingUp, Download, Plus, Flag, MessageSquare, BarChart3 } from 'lucide-react';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface Campaign {
  id: string;
  title: string;
  description: string;
  business: {
    id: string;
    name: string;
    verified: boolean;
  };
  category: string;
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'under_review' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  requirements: {
    minFollowers: number;
    minEngagement: number;
    ageRange: string;
    location: string[];
  };
  applications: number;
  approved: number;
  submissions: number;
  reach: number;
  engagement: number;
  roi: number;
  flags: {
    count: number;
    reasons: string[];
  };
  lastActivity: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Summer Fashion Collection Launch',
    description: 'Promote our new summer collection with authentic lifestyle content',
    business: {
      id: 'b1',
      name: 'StyleCorp',
      verified: true
    },
    category: 'Fashion',
    budget: 15000,
    status: 'active',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-02-29T23:59:59Z',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    requirements: {
      minFollowers: 10000,
      minEngagement: 3.5,
      ageRange: '18-35',
      location: ['US', 'CA', 'UK']
    },
    applications: 45,
    approved: 12,
    submissions: 8,
    reach: 850000,
    engagement: 42500,
    roi: 285,
    flags: {
      count: 0,
      reasons: []
    },
    lastActivity: '2024-02-01T14:30:00Z'
  },
  {
    id: '2',
    title: 'Tech Product Review Campaign',
    description: 'Honest reviews of our latest smartphone accessories',
    business: {
      id: 'b2',
      name: 'TechNova',
      verified: false
    },
    category: 'Technology',
    budget: 8500,
    status: 'under_review',
    priority: 'medium',
    createdAt: '2024-01-28T15:30:00Z',
    startDate: '2024-02-05T00:00:00Z',
    endDate: '2024-02-20T23:59:59Z',
    platforms: ['YouTube', 'Instagram'],
    requirements: {
      minFollowers: 25000,
      minEngagement: 4.0,
      ageRange: '20-45',
      location: ['US', 'CA']
    },
    applications: 23,
    approved: 0,
    submissions: 0,
    reach: 0,
    engagement: 0,
    roi: 0,
    flags: {
      count: 2,
      reasons: ['Suspicious requirements', 'Unverified business']
    },
    lastActivity: '2024-01-30T09:15:00Z'
  },
  {
    id: '3',
    title: 'Fitness Challenge Promotion',
    description: '30-day fitness challenge with our workout app',
    business: {
      id: 'b3',
      name: 'FitTech Solutions',
      verified: true
    },
    category: 'Health & Fitness',
    budget: 12000,
    status: 'completed',
    priority: 'medium',
    createdAt: '2024-01-10T08:00:00Z',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    platforms: ['Instagram', 'TikTok'],
    requirements: {
      minFollowers: 15000,
      minEngagement: 5.0,
      ageRange: '18-40',
      location: ['US', 'CA', 'AU']
    },
    applications: 67,
    approved: 20,
    submissions: 18,
    reach: 1200000,
    engagement: 95000,
    roi: 340,
    flags: {
      count: 0,
      reasons: []
    },
    lastActivity: '2024-01-31T20:45:00Z'
  },
  {
    id: '4',
    title: 'Food Delivery App Launch',
    description: 'Promote our new food delivery service in major cities',
    business: {
      id: 'b4',
      name: 'QuickEats',
      verified: true
    },
    category: 'Food & Beverage',
    budget: 25000,
    status: 'active',
    priority: 'urgent',
    createdAt: '2024-01-20T12:00:00Z',
    startDate: '2024-01-25T00:00:00Z',
    endDate: '2024-02-15T23:59:59Z',
    platforms: ['Instagram', 'TikTok', 'YouTube', 'Twitter'],
    requirements: {
      minFollowers: 20000,
      minEngagement: 4.5,
      ageRange: '18-50',
      location: ['US']
    },
    applications: 89,
    approved: 25,
    submissions: 15,
    reach: 1800000,
    engagement: 125000,
    roi: 420,
    flags: {
      count: 1,
      reasons: ['High budget concern']
    },
    lastActivity: '2024-02-01T16:20:00Z'
  },
  {
    id: '5',
    title: 'Beauty Product Collaboration',
    description: 'Showcase our new skincare line with before/after content',
    business: {
      id: 'b5',
      name: 'BeautyBrand',
      verified: true
    },
    category: 'Beauty',
    budget: 18000,
    status: 'rejected',
    priority: 'low',
    createdAt: '2024-01-25T14:30:00Z',
    startDate: '2024-02-10T00:00:00Z',
    endDate: '2024-03-10T23:59:59Z',
    platforms: ['Instagram', 'YouTube'],
    requirements: {
      minFollowers: 50000,
      minEngagement: 6.0,
      ageRange: '18-35',
      location: ['US', 'CA', 'UK', 'AU']
    },
    applications: 12,
    approved: 0,
    submissions: 0,
    reach: 0,
    engagement: 0,
    roi: 0,
    flags: {
      count: 3,
      reasons: ['Unrealistic requirements', 'Misleading claims', 'Policy violation']
    },
    lastActivity: '2024-01-28T11:45:00Z'
  }
];

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || campaign.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const campaignStats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    underReview: campaigns.filter(c => c.status === 'under_review').length,
    rejected: campaigns.filter(c => c.status === 'rejected').length,
    flagged: campaigns.filter(c => c.flags.count > 0).length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalApplications: campaigns.reduce((sum, c) => sum + c.applications, 0)
  };

  const categories = ['Fashion', 'Technology', 'Health & Fitness', 'Food & Beverage', 'Beauty', 'Travel', 'Gaming', 'Education'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'under_review': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paused': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'cancelled': return <Ban className="w-4 h-4 text-gray-500" />;
      case 'draft': return <Edit className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  const handleCampaignAction = (campaignId: string, action: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        switch (action) {
          case 'approve':
            return { ...campaign, status: 'active' as const };
          case 'reject':
            return { ...campaign, status: 'rejected' as const };
          case 'pause':
            return { ...campaign, status: 'paused' as const };
          case 'resume':
            return { ...campaign, status: 'active' as const };
          case 'flag':
            return { 
              ...campaign, 
              flags: { 
                count: campaign.flags.count + 1, 
                reasons: [...campaign.flags.reasons, 'Manual flag by admin'] 
              } 
            };
          default:
            return campaign;
        }
      }
      return campaign;
    }));
  };

  const openCampaignDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsCampaignDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage platform campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Campaigns
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{campaignStats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
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
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{campaignStats.active}</p>
                <p className="text-sm text-gray-600">Active</p>
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
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{campaignStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
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
              <div className="text-center">
                <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{campaignStats.underReview}</p>
                <p className="text-sm text-gray-600">Review</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{campaignStats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Flag className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{campaignStats.flagged}</p>
                <p className="text-sm text-gray-600">Flagged</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-bold">{formatCurrency(campaignStats.totalBudget)}</p>
                <p className="text-sm text-gray-600">Budget</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatNumber(campaignStats.totalApplications)}</p>
                <p className="text-sm text-gray-600">Applications</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search campaigns by title, business, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
            <CardDescription>Monitor and manage platform campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign, index) => (
                  <motion.tr
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.title}</p>
                        <p className="text-sm text-gray-600">{campaign.category}</p>
                        <div className="flex gap-1 mt-1">
                          {campaign.platforms.slice(0, 2).map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                          {campaign.platforms.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{campaign.platforms.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {campaign.business.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{campaign.business.name}</p>
                          {campaign.business.verified && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(campaign.status)}
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(campaign.priority)}>
                        {campaign.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(campaign.budget)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{campaign.applications} applied</p>
                        <p className="text-xs text-gray-600">{campaign.approved} approved</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{formatNumber(campaign.reach)} reach</p>
                        <p className="text-xs text-gray-600">{campaign.roi}% ROI</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.flags.count > 0 ? (
                        <Badge className="bg-red-100 text-red-800">
                          <Flag className="w-3 h-3 mr-1" />
                          {campaign.flags.count}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Clean
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCampaignDialog(campaign)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={(action) => handleCampaignAction(campaign.id, action)}>
                          <SelectTrigger className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </SelectTrigger>
                          <SelectContent>
                            {campaign.status === 'under_review' && (
                              <>
                                <SelectItem value="approve">Approve</SelectItem>
                                <SelectItem value="reject">Reject</SelectItem>
                              </>
                            )}
                            {campaign.status === 'active' && (
                              <SelectItem value="pause">Pause</SelectItem>
                            )}
                            {campaign.status === 'paused' && (
                              <SelectItem value="resume">Resume</SelectItem>
                            )}
                            <SelectItem value="flag">Flag</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </MotionDiv>

      {/* Campaign Details Dialog */}
      <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedCampaign && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-500" />
                  <div>
                    <h2 className="text-xl font-bold">{selectedCampaign.title}</h2>
                    <p className="text-gray-600">{selectedCampaign.business.name}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="flags">Flags & Issues</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-sm text-gray-600">{selectedCampaign.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Status:</span>
                          <Badge className={getStatusColor(selectedCampaign.status)}>
                            {selectedCampaign.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Priority:</span>
                          <Badge className={getPriorityColor(selectedCampaign.priority)}>
                            {selectedCampaign.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Duration:</span>
                          <span className="text-sm font-medium">
                            {formatDate(selectedCampaign.startDate)} - {formatDate(selectedCampaign.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Budget:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedCampaign.budget)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                            {selectedCampaign.business.name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{selectedCampaign.business.name}</p>
                            {selectedCampaign.business.verified ? (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Platforms</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedCampaign.platforms.map(platform => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Influencer Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-lg font-bold">{formatNumber(selectedCampaign.requirements.minFollowers)}</p>
                          <p className="text-sm text-gray-600">Min Followers</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-lg font-bold">{selectedCampaign.requirements.minEngagement}%</p>
                          <p className="text-sm text-gray-600">Min Engagement</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-lg font-bold">{selectedCampaign.requirements.ageRange}</p>
                          <p className="text-sm text-gray-600">Age Range</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-lg font-bold">{selectedCampaign.requirements.location.length}</p>
                          <p className="text-sm text-gray-600">Locations</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Target Locations:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedCampaign.requirements.location.map(loc => (
                            <Badge key={loc} variant="outline" className="text-xs">
                              {loc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{selectedCampaign.applications}</p>
                          <p className="text-sm text-gray-600">Applications</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{selectedCampaign.approved}</p>
                          <p className="text-sm text-gray-600">Approved</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{selectedCampaign.submissions}</p>
                          <p className="text-sm text-gray-600">Submissions</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{formatNumber(selectedCampaign.reach)}</p>
                          <p className="text-sm text-gray-600">Total Reach</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{formatNumber(selectedCampaign.engagement)}</p>
                          <p className="text-sm text-gray-600">Engagement</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{selectedCampaign.roi}%</p>
                          <p className="text-sm text-gray-600">ROI</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="flags" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Flags & Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedCampaign.flags.count > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Flag className="w-5 h-5 text-red-500" />
                            <span className="font-medium">{selectedCampaign.flags.count} flag(s) reported</span>
                          </div>
                          <div className="space-y-2">
                            {selectedCampaign.flags.reasons.map((reason, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-sm">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                          <p>No flags or issues reported</p>
                          <p className="text-sm">This campaign is clean and compliant</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}