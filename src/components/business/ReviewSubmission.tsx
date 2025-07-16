'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, ExternalLink, Clock, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSubmissionReview } from '@/hooks/useSubmissionReview';

interface Submission {
  id: string;
  application_id: string;
  title: string | null;
  description: string | null;
  notes: string | null;
  images: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  videos: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  links: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  documents: Array<{
    id: string;
    url: string;
    description: string;
  }>;
  attachments: Array<{
    url: string;
    description: string;
  }> | null; // Legacy support
  status: string;
  review_notes: string | null;
  revision_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  auto_approve_date: string;
  application: {
    id: string;
    status: string;
    campaign: {
      title: string;
      budget: number;
    };
    influencer: {
      username: string;
    };
  };
}

interface ReviewSubmissionProps {
  applicationId: string;
  onReviewComplete?: () => void;
  className?: string;
}

export default function ReviewSubmission({ 
  applicationId, 
  onReviewComplete,
  className 
}: ReviewSubmissionProps) {
  const {
    submission,
    isLoading: loading,
    isSubmitting: reviewing,
    fetchSubmission,
    reviewSubmission,
  } = useSubmissionReview();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (applicationId) {
      fetchSubmission(applicationId);
    }
  }, [applicationId, fetchSubmission]);



  const handleApprove = async () => {
    if (!submission) return;

    try {
      await reviewSubmission(submission.id, {
        status: 'approved',
        notes: reviewNotes.trim() || undefined
      });
      
      setSuccess('Submission approved successfully! Payment has been released to the influencer.');
      setShowApproveDialog(false);
      setReviewNotes('');
      
      setTimeout(() => {
        onReviewComplete?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve submission');
    }
  };

  const handleReject = async () => {
    if (!submission) return;

    try {
      if (!reviewNotes.trim()) {
        throw new Error('Please provide feedback explaining why the submission needs changes');
      }

      await reviewSubmission(submission.id, {
        status: 'revision_requested',
        notes: reviewNotes.trim()
      });

      setSuccess('Feedback sent to influencer. They can resubmit their work with the requested changes.');
      setShowRejectDialog(false);
      setReviewNotes('');
      
      setTimeout(() => {
        onReviewComplete?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request changes');
    }
  };

  const getDaysUntilAutoApprove = () => {
    if (!submission) return 0;
    const autoApproveDate = new Date(submission.auto_approve_date);
    const now = new Date();
    const diffTime = autoApproveDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading submission...</span>
      </div>
    );
  }

  if (!submission) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No submission found for this application.</p>
        </CardContent>
      </Card>
    );
  }

  const daysUntilAutoApprove = getDaysUntilAutoApprove();

  return (
    <div className={className}>
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Work Submission Review</CardTitle>
              <CardDescription>
                Review the completed work from {submission.application.influencer.username}
              </CardDescription>
            </div>
            <Badge variant={submission.application.status === 'submitted' ? 'default' : 'secondary'}>
              {submission.application.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Campaign</Label>
              <p className="text-sm text-gray-600">{submission.application.campaign.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Budget</Label>
              <p className="text-sm text-gray-600">₦{submission.application.campaign.budget.toLocaleString()}</p>
            </div>
          </div>

          {/* Submission Details */}
          <div className="space-y-4">
            {submission.title && (
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm font-semibold">{submission.title}</p>
                </div>
              </div>
            )}

            {submission.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm whitespace-pre-wrap">{submission.description}</p>
                </div>
              </div>
            )}

            {submission.notes && (
              <div>
                <Label className="text-sm font-medium">Notes</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm whitespace-pre-wrap">{submission.notes}</p>
                </div>
              </div>
            )}

            {/* Images */}
            {submission.images && submission.images.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Images</Label>
                <div className="mt-2 space-y-2">
                  {submission.images.map((image, index) => (
                    <div key={image.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{image.description || `Image ${index + 1}`}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{image.url}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(image.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {submission.videos && submission.videos.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Videos</Label>
                <div className="mt-2 space-y-2">
                  {submission.videos.map((video, index) => (
                    <div key={video.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{video.description || `Video ${index + 1}`}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{video.url}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {submission.links && submission.links.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Links</Label>
                <div className="mt-2 space-y-2">
                  {submission.links.map((link, index) => (
                    <div key={link.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{link.description || `Link ${index + 1}`}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{link.url}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {submission.documents && submission.documents.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Documents</Label>
                <div className="mt-2 space-y-2">
                  {submission.documents.map((document, index) => (
                    <div key={document.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{document.description || `Document ${index + 1}`}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{document.url}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy attachments support */}
            {submission.attachments && submission.attachments.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Attachments</Label>
                <div className="mt-2 space-y-2">
                  {submission.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{attachment.description || `Attachment ${index + 1}`}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{attachment.url}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Submitted At</Label>
              <p className="text-sm text-gray-600">{formatDate(submission.submitted_at)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Auto-Approve Date</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <p className="text-sm text-gray-600">{formatDate(submission.auto_approve_date)}</p>
              </div>
            </div>
          </div>

          {/* Auto-approve warning */}
          {daysUntilAutoApprove > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                This submission will be automatically approved in {daysUntilAutoApprove} day{daysUntilAutoApprove !== 1 ? 's' : ''} if no action is taken.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {submission.application.status === 'submitted' && (
            <div className="flex items-center space-x-3 pt-4">
              <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Submission
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve Submission</DialogTitle>
                    <DialogDescription>
                      Approving this submission will release the escrow payment to the influencer. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="approve-notes">Review Notes (Optional)</Label>
                      <Textarea
                        id="approve-notes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add any feedback or comments about the submission..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleApprove} disabled={reviewing} className="bg-green-600 hover:bg-green-700">
                      {reviewing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Approve & Release Payment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    <XCircle className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Changes</DialogTitle>
                    <DialogDescription>
                      Provide specific feedback about what needs to be changed or improved in the submission.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reject-notes">Feedback *</Label>
                      <Textarea
                        id="reject-notes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Explain what changes are needed and provide specific feedback..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleReject} 
                      disabled={reviewing || !reviewNotes.trim()}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      variant="outline"
                    >
                      {reviewing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Send Feedback
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}