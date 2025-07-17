'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApplications } from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import SubmitWork from '@/components/influencer/SubmitWork';
import AnalyticsSubmissionForm from '@/components/campaign-analytics/AnalyticsSubmissionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageCircle, FileText, Upload, Download, TrendingUp, Users } from 'lucide-react';
import { MotionDiv } from '@/components/performance/LazyMotion';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { applications, loading, error } = useApplications({ influencerId: user?.id });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedApplicationForSubmission, setSelectedApplicationForSubmission] = useState<string | null>(null);
  const [selectedApplicationForAnalytics, setSelectedApplicationForAnalytics] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const statuses = ['all', 'pending', 'in_review', 'approved', 'rejected', 'revision_requested', 'completed'];
  const categories = ['all', 'Fashion', 'Beauty', 'Fitness', 'Technology', 'Travel', 'Food', 'Lifestyle'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'Status' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low', label: 'Lowest Budget' }
  ];

  const filteredApplications = applications?.filter(application => {
    const businessProfile = application.campaign?.business;
    const matchesSearch = application.campaign?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         businessProfile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         businessProfile?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         businessProfile?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || application.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || businessProfile?.company_name === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'budget_high':
        return (b.campaign?.budget_max || b.proposed_rate || 0) - (a.campaign?.budget_max || a.proposed_rate || 0);
      case 'budget_low':
        return (a.campaign?.budget_min || a.proposed_rate || 0) - (b.campaign?.budget_min || b.proposed_rate || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'revision_requested': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_review': return <AlertCircle className="w-4 h-4" />;
      case 'revision_requested': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getApplicationStats = () => {
    const total = applications?.length || 0;
    const pending = applications?.filter(app => app.status === 'pending').length || 0;
    const approved = applications?.filter(app => app.status === 'approved').length || 0;
    const completed = applications?.filter(app => app.status === 'completed').length || 0;
    const rejected = applications?.filter(app => app.status === 'rejected').length || 0;
    
    return { total, pending, approved, completed, rejected };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading applications: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getApplicationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track and manage your campaign applications</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
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
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <MotionDiv
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </MotionDiv>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {sortedApplications.map((application, index) => (
          <MotionDiv
            key={application.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                      {(application.campaign?.business?.first_name || application.campaign?.title || 'C').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{application.campaign?.title || 'Untitled Campaign'}</h3>
                      <p className="text-sm text-gray-600">
                        {application.campaign?.business?.first_name && application.campaign?.business?.last_name
                          ? `${application.campaign.business.first_name} ${application.campaign.business.last_name}`
                          : application.campaign?.business?.company_name || 'Business Name'
                        }
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {application.campaign?.business?.company_name || 'General'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(application.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(application.status)}
                        {application.status.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Application Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">{application.proposed_rate ? 'Proposed Rate' : 'Campaign Budget'}</p>
                      <p className="font-semibold">
                        {application.proposed_rate 
                          ? formatCurrency(application.proposed_rate) 
                          : `${formatCurrency(application.campaign?.budget_min || 0)} - ${formatCurrency(application.campaign?.budget_max || 0)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Applied</p>
                      <p className="font-semibold">{new Date(application.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold">{new Date(application.updated_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <p className="text-sm font-medium mb-2">Deliverables</p>
                  <div className="flex flex-wrap gap-2">
                    {application.campaign?.description && (
                      <Badge variant="outline" className="text-xs">
                        Campaign Details Available
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Expected Metrics */}
                {application.estimated_reach && (
                  <div>
                    <p className="text-sm font-medium mb-2">Expected Performance</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Reach: </span>
                        <span className="font-medium">{application.estimated_reach?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Engagement: </span>
                        <span className="font-medium">{Math.round((application.estimated_reach || 0) * 0.05).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Message */}
                <div>
                  <p className="text-sm font-medium mb-2">Application Message</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {application.proposal}
                  </p>
                </div>

                {/* Feedback */}
                {application.status === 'rejected' && (
                  <div>
                    <p className="text-sm font-medium mb-2">Feedback</p>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      Application was not selected for this campaign.
                    </p>
                  </div>
                )}

                {/* Revision Feedback */}
                {application.status === 'revision_requested' && (
                  <div>
                    <p className="text-sm font-medium mb-2">Revision Request</p>
                    <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                      {application.review_notes || 'The brand has requested revisions to your submission. Please review their feedback and resubmit your work.'}
                    </p>
                    <Button
                      onClick={() => setSelectedApplicationForSubmission(application.id)}
                      className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                      size="sm"
                    >
                      Resubmit Work
                    </Button>
                  </div>
                )}

                {/* Attachments */}
                {application.portfolio_links && application.portfolio_links.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {application.portfolio_links.map((link: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{link}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t my-4" />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/influencer/campaigns/${application.campaign?.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Campaign
                    </Button>
                    {application.status === 'approved' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/influencer/messages?applicationId=${application.id}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message Brand
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedApplicationForSubmission(application.id)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Work
                        </Button>
                      </>
                    )}
                    {(application.status === 'submitted' || application.status === 'pending') && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Work Submitted - Under Review
                      </Badge>
                    )}
                    {application.status === 'revision_requested' && (
                      <>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Revision Requested
                        </Badge>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedApplicationForSubmission(application.id)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Revision
                        </Button>
                      </>
                    )}
                    {application.status === 'completed' && (
                      <>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedApplicationForAnalytics(application.id)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Analytics
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {application.updated_at && application.updated_at !== application.created_at && (
                      <span>Last updated: {new Date(application.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
      </div>

      {/* Empty State */}
      {sortedApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setSelectedStatus('all');
            setSelectedCategory('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {sortedApplications.length > 0 && sortedApplications.length >= 10 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Applications
          </Button>
        </div>
      )}

      {/* Submit Work Modal */}
      <Dialog open={!!selectedApplicationForSubmission} onOpenChange={() => setSelectedApplicationForSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
            </DialogTitle>
          </DialogHeader>
          {selectedApplicationForSubmission && (
            <SubmitWork 
              applicationId={selectedApplicationForSubmission}
              campaignTitle={applications.find(app => app.id === selectedApplicationForSubmission)?.campaign?.title}
              onSubmissionSuccess={() => {
                setSelectedApplicationForSubmission(null);
                // Refresh applications to show updated status
                window.location.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Submission Modal */}
      <Dialog open={!!selectedApplicationForAnalytics} onOpenChange={() => setSelectedApplicationForAnalytics(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Campaign Analytics</DialogTitle>
          </DialogHeader>
          {selectedApplicationForAnalytics && (
            <AnalyticsSubmissionForm 
              applicationId={selectedApplicationForAnalytics}
              campaignId={applications.find(app => app.id === selectedApplicationForAnalytics)?.campaign?.id || ''}
              onSubmit={() => {
                setSelectedApplicationForAnalytics(null);
                // Refresh applications
                window.location.reload();
              }}
              onCancel={() => setSelectedApplicationForAnalytics(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}