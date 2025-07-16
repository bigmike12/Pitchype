'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, Clock, CheckCircle, XCircle, MessageSquare, Loader2, ExternalLink, Eye, Download, Play, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useSubmissionActions } from '@/hooks/useSubmissionActions';

interface Submission {
  id: string;
  influencer: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  submittedAt: string;
  title?: string;
  description?: string;
  notes?: string;
  images: {
    id: string;
    url: string;
    description: string;
  }[];
  videos: {
    id: string;
    url: string;
    description: string;
  }[];
  links: {
    id: string;
    url: string;
    description: string;
  }[];
  documents: {
    id: string;
    url: string;
    description: string;
  }[];
  attachments: {
    url: string;
    description: string;
  }[]; // Legacy support
  feedback?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
}

// Transform API data to UI format
function transformSubmissionData(apiData: any): Submission {
  return {
    id: apiData.id,
    influencer: {
      id: apiData.influencer_id || 'unknown',
      name: apiData.influencer?.first_name && apiData.influencer?.last_name
        ? `${apiData.influencer.first_name} ${apiData.influencer.last_name}`
        : apiData.influencer?.email || 'Unknown',
      username: `@${apiData.influencer?.email?.split('@')[0] || 'unknown'}`,
      avatar: apiData.influencer?.avatar_url || '/placeholder-avatar.png'
    },
    status: apiData.status || 'pending',
    submittedAt: apiData.submitted_at,
    title: apiData.title,
    description: apiData.description,
    notes: apiData.notes,
    images: apiData.images || [],
    videos: apiData.videos || [],
    links: apiData.links || [],
    documents: apiData.documents || [],
    attachments: apiData.attachments || [], // Legacy support
    feedback: apiData.review_notes,
    metrics: {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0
    }
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revision_requested: 'bg-blue-100 text-blue-800'
};

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  revision_requested: MessageSquare
};

export default function CampaignSubmissionsPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [submissionForRevision, setSubmissionForRevision] = useState<string | null>(null);

  
  // Fetch real submissions data
  const { submissions: apiSubmissions, loading, error, refetch } = useSubmissions(campaignId);
  const { updateSubmissionStatus, isUpdating } = useSubmissionActions();
  
  // Transform API data to UI format
  const submissions = apiSubmissions.map(transformSubmissionData);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.influencer.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (submissionId: string, newStatus: 'approved' | 'rejected' | 'revision_requested', feedbackText?: string) => {
    try {
      await updateSubmissionStatus({
        submissionId,
        status: newStatus,
        reviewNotes: feedbackText
      });
      await refetch();
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  const handleRevisionRequest = (submissionId: string) => {
    setSubmissionForRevision(submissionId);
    setRevisionDialogOpen(true);
    setRevisionReason('');
  };

  const submitRevisionRequest = async () => {
    if (!submissionForRevision || !revisionReason.trim()) {
      toast.error('Please provide a reason for the revision request');
      return;
    }

    try {
      await handleStatusChange(submissionForRevision, 'revision_requested', revisionReason);
      setRevisionDialogOpen(false);
      setSubmissionForRevision(null);
      setRevisionReason('');
      toast.success('Revision request sent to influencer');
    } catch (error) {
      console.error('Error requesting revision:', error);
    }
  };

  const getStatusCounts = () => {
    return {
      all: submissions.length,
      pending: submissions.filter(sub => sub.status === 'pending').length,
      approved: submissions.filter(sub => sub.status === 'approved').length,
      rejected: submissions.filter(sub => sub.status === 'rejected').length,
      revision_requested: submissions.filter(sub => sub.status === 'revision_requested').length
    };
  };

  const statusCounts = getStatusCounts();

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/business/campaigns/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Submissions</h1>
            <p className="text-gray-600 mt-1">Review and approve submitted content</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading submissions</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Content Submissions</h1>
          <p className="text-gray-600 mt-1">Review and approve submitted content</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{statusCounts.all}</p>
              <p className="text-sm text-gray-600">Total Submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
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
              <p className="text-2xl font-bold text-blue-600">{statusCounts.revision_requested}</p>
              <p className="text-sm text-gray-600">Revisions</p>
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
                placeholder="Search by influencer name..."
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
                <SelectItem value="revision_requested">Revisions ({statusCounts.revision_requested})</SelectItem>
                <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading submissions...</p>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      {!loading && (
        <div className="space-y-6">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-600">No content submissions match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission, index) => {
              const StatusIcon = statusIcons[submission.status];
              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={submission.influencer.avatar} />
                            <AvatarFallback>{submission.influencer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{submission.influencer.name}</h3>
                            <p className="text-gray-600 text-sm">{submission.influencer.username}</p>
                          </div>
                          <Badge className={statusColors[submission.status]}>
                            {(() => {
                              const IconComponent = statusIcons[submission.status];
                              return <IconComponent className="w-3 h-3 mr-1" />;
                            })()}
                            {submission.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {submission.title && (
                        <h4 className="font-semibold text-gray-900 mb-2">{submission.title}</h4>
                      )}
                      
                      {submission.description && (
                        <p className="text-gray-600 mb-4">{submission.description}</p>
                      )}
                      
                      {submission.notes && (
                        <p className="text-gray-500 text-sm mb-4 italic">{submission.notes}</p>
                      )}
                      
                      {/* Media Preview */}
                      <div className="space-y-4 mb-4">
                        {/* Images */}
                        {submission.images.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Images ({submission.images.length})</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {submission.images.slice(0, 4).map((image, idx) => (
                                <div key={image.id || idx} className="relative group cursor-pointer"
                                     onClick={() => window.open(image.url, '_blank')}>
                                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-transparent group-hover:border-blue-200 transition-all">
                                    <Image
                                      src={image.url}
                                      alt={image.description || 'Submission image'}
                                      width={200}
                                      height={200}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="bg-white/90 rounded-full p-2">
                                        <Eye className="w-4 h-4 text-gray-700" />
                                      </div>
                                    </div>
                                  </div>
                                  {image.description && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                                      <p className="text-white text-xs truncate">{image.description}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {submission.images.length > 4 && (
                                <button 
                                  className="aspect-square bg-gray-100 hover:bg-blue-50 rounded-lg flex flex-col items-center justify-center transition-colors border border-transparent hover:border-blue-200 group"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-blue-600 mb-1 transition-colors" />
                                  <span className="text-gray-600 group-hover:text-blue-700 text-sm font-medium transition-colors">+{submission.images.length - 4}</span>
                                  <span className="text-gray-500 group-hover:text-blue-600 text-xs transition-colors">more images</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Videos */}
                        {submission.videos.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Videos ({submission.videos.length})</h5>
                            <div className="space-y-2">
                              {submission.videos.slice(0, 2).map((video, idx) => (
                                <div key={video.id || idx} className="group">
                                  <div className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                                       onClick={() => window.open(video.url, '_blank')}>
                                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-600 transition-colors">
                                      <Play className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                                        {video.description || `Video ${idx + 1}`}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{video.url}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                  </div>
                                </div>
                              ))}
                              {submission.videos.length > 2 && (
                                <button 
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 p-2 hover:bg-blue-50 rounded transition-colors"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Play className="w-3 h-3" />
                                  View all {submission.videos.length} videos
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Links */}
                        {submission.links.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Links ({submission.links.length})</h5>
                            <div className="space-y-2">
                              {submission.links.slice(0, 3).map((link, idx) => (
                                <div key={link.id || idx} className="group">
                                  <div className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                                       onClick={() => window.open(link.url, '_blank')}>
                                    <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mr-3 transition-colors">
                                      <LinkIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                                        {link.description || 'Social Media Post'}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate group-hover:text-blue-600">{link.url}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                  </div>
                                </div>
                              ))}
                              {submission.links.length > 3 && (
                                <button 
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 p-2 hover:bg-blue-50 rounded transition-colors"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Eye className="w-3 h-3" />
                                  View all {submission.links.length} links
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Documents */}
                        {submission.documents.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Documents ({submission.documents.length})</h5>
                            <div className="space-y-2">
                              {submission.documents.slice(0, 3).map((doc, idx) => (
                                <div key={doc.id || idx} className="group">
                                  <div className="flex items-center p-3 bg-gray-50 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-200 transition-all cursor-pointer"
                                       onClick={() => window.open(doc.url, '_blank')}>
                                    <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mr-3 transition-colors">
                                      <FileText className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-900">
                                        {doc.description || 'Document'}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate group-hover:text-green-600">
                                        Click to view document
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Eye className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                      <Download className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {submission.documents.length > 3 && (
                                <button 
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 p-2 hover:bg-blue-50 rounded transition-colors"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Eye className="w-3 h-3" />
                                  View all {submission.documents.length} documents
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Legacy attachments */}
                        {submission.attachments.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments ({submission.attachments.length})</h5>
                            <div className="space-y-2">
                              {submission.attachments.slice(0, 3).map((attachment, idx) => (
                                <div key={idx} className="group">
                                  <div className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                                       onClick={() => window.open(attachment.url, '_blank')}>
                                    <div className="w-8 h-8 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center mr-3 transition-colors">
                                      <FileText className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                                        {attachment.description || 'Attachment'}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        Click to view attachment
                                      </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                  </div>
                                </div>
                              ))}
                              {submission.attachments.length > 3 && (
                                <button 
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 p-2 hover:bg-blue-50 rounded transition-colors"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Eye className="w-3 h-3" />
                                  View all {submission.attachments.length} attachments
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Metrics */}
                      {submission.metrics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-lg font-semibold">{submission.metrics.likes.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Likes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">{submission.metrics.comments}</p>
                            <p className="text-sm text-gray-600">Comments</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">{submission.metrics.shares}</p>
                            <p className="text-sm text-gray-600">Shares</p>
                          </div>
                          {/* {submission.metrics.views && (
                            <div className="text-center">
                              <p className="text-lg font-semibold">{submission.metrics.views.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">Views</p>
                            </div>
                          )} */}
                        </div>
                      )}

                      {/* Feedback */}
                      {submission.feedback && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Feedback:</p>
                          <p className="text-sm text-blue-800">{submission.feedback}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSubmission(submission)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {submission.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(submission.id, 'approved')}
                              disabled={isUpdating}
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevisionRequest(submission.id)}
                              disabled={isUpdating}
                              className="flex-1"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Request Revision
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusChange(submission.id, 'rejected')}
                              disabled={isUpdating}
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Detailed Submission Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedSubmission.influencer.avatar} />
                    <AvatarFallback>{selectedSubmission.influencer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedSubmission.influencer.name}</h3>
                    <p className="text-gray-600 text-sm">{selectedSubmission.influencer.username}</p>
                  </div>
                  <Badge className={statusColors[selectedSubmission.status]}>
                    {(() => {
                      const IconComponent = statusIcons[selectedSubmission.status];
                      return <IconComponent className="w-3 h-3 mr-1" />;
                    })()}
                    {selectedSubmission.status.replace('_', ' ')}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedSubmission.title && (
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">{selectedSubmission.title}</h4>
                  </div>
                )}
                
                {selectedSubmission.description && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Description</h5>
                    <p className="text-gray-600">{selectedSubmission.description}</p>
                  </div>
                )}
                
                {selectedSubmission.notes && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Notes</h5>
                    <p className="text-gray-500 italic">{selectedSubmission.notes}</p>
                  </div>
                )}
                
                {/* All Images */}
                {selectedSubmission.images.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Images ({selectedSubmission.images.length})</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedSubmission.images.map((image, idx) => (
                        <div key={image.id || idx} className="relative group cursor-pointer"
                             onClick={() => window.open(image.url, '_blank')}>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-transparent group-hover:border-blue-200 transition-all">
                            <Image
                              src={image.url}
                              alt={image.description || 'Submission image'}
                              width={300}
                              height={300}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 rounded-full p-2">
                                <Eye className="w-4 h-4 text-gray-700" />
                              </div>
                            </div>
                          </div>
                          {image.description && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                              <p className="text-white text-xs">{image.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Videos */}
                {selectedSubmission.videos.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Videos ({selectedSubmission.videos.length})</h5>
                    <div className="space-y-3">
                      {selectedSubmission.videos.map((video, idx) => (
                        <div key={video.id || idx} className="group">
                          <div className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                               onClick={() => window.open(video.url, '_blank')}>
                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-600 transition-colors">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 group-hover:text-gray-700">
                                {video.description || `Video ${idx + 1}`}
                              </p>
                              <p className="text-sm text-gray-500 truncate">{video.url}</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Links */}
                {selectedSubmission.links.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Links ({selectedSubmission.links.length})</h5>
                    <div className="space-y-3">
                      {selectedSubmission.links.map((link, idx) => (
                        <div key={link.id || idx} className="group">
                          <div className="flex items-center p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                               onClick={() => window.open(link.url, '_blank')}>
                            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mr-4 transition-colors">
                              <LinkIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 group-hover:text-blue-900">
                                {link.description || 'Social Media Post'}
                              </p>
                              <p className="text-sm text-gray-500 truncate group-hover:text-blue-600">{link.url}</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Documents */}
                {selectedSubmission.documents.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Documents ({selectedSubmission.documents.length})</h5>
                    <div className="space-y-3">
                      {selectedSubmission.documents.map((doc, idx) => (
                        <div key={doc.id || idx} className="group">
                          <div className="flex items-center p-4 bg-gray-50 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-200 transition-all cursor-pointer"
                               onClick={() => window.open(doc.url, '_blank')}>
                            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mr-4 transition-colors">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 group-hover:text-green-900">
                                {doc.description || 'Document'}
                              </p>
                              <p className="text-sm text-gray-500 group-hover:text-green-600">
                                Click to view document
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Eye className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                              <Download className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Metrics */}
                {selectedSubmission.metrics && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Performance Metrics</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-gray-900">{selectedSubmission.metrics.likes.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-gray-900">{selectedSubmission.metrics.comments}</p>
                        <p className="text-sm text-gray-600">Comments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-gray-900">{selectedSubmission.metrics.shares}</p>
                        <p className="text-sm text-gray-600">Shares</p>
                      </div>
                      {selectedSubmission.metrics.views && (
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-gray-900">{selectedSubmission.metrics.views.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Views</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Feedback */}
                {selectedSubmission.feedback && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Previous Feedback</h5>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">{selectedSubmission.feedback}</p>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                {selectedSubmission.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => {
                        handleStatusChange(selectedSubmission.id, 'approved');
                        setSelectedSubmission(null);
                      }}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Submission
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedSubmission(null);
                        handleRevisionRequest(selectedSubmission.id);
                      }}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Revision
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleStatusChange(selectedSubmission.id, 'rejected');
                        setSelectedSubmission(null);
                      }}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Revision Request Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="revision-reason">Reason for revision request</Label>
              <Textarea
                id="revision-reason"
                placeholder="Please explain what needs to be revised..."
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevisionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRevisionRequest}
              disabled={!revisionReason.trim() || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}