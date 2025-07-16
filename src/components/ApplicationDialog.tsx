'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { useApplications, useApplicationManagement } from '@/hooks/useApplications';

interface ApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  onApplicationSubmitted: () => void;
}

export function ApplicationDialog({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  onApplicationSubmitted
}: ApplicationDialogProps) {
  const { createApplication } = useApplications();
  const {
    applicationStatus,
    isCheckingStatus,
    checkApplicationStatus,
  } = useApplicationManagement();
  const [proposal, setProposal] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [estimatedReach, setEstimatedReach] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proposal.trim()) {
      toast.error('Please provide a proposal');
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationData = {
        campaign_id: campaignId,
        proposal: proposal.trim(),
        proposed_rate: proposedRate ? parseFloat(proposedRate) : undefined,
        estimated_reach: estimatedReach ? parseInt(estimatedReach) : undefined,
        portfolio_links: portfolioLinks ? portfolioLinks.split('\n').filter(link => link.trim()) : []
      };

      await createApplication(applicationData);
      toast.success('Application submitted successfully!');
      onApplicationSubmitted();
      onClose();
      // Reset form
      setProposal('');
      setProposedRate('');
      setEstimatedReach('');
      setPortfolioLinks('');
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to Campaign</DialogTitle>
          <DialogDescription>
            Submit your application for "{campaignTitle}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposal">Proposal *</Label>
            <Textarea
              id="proposal"
              placeholder="Describe why you're a good fit for this campaign and your content ideas..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="proposedRate">Proposed Rate (₦)</Label>
            <Input
              id="proposedRate"
              type="number"
              placeholder="Enter your proposed rate"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimatedReach">Estimated Reach</Label>
            <Input
              id="estimatedReach"
              type="number"
              placeholder="Expected number of people reached"
              value={estimatedReach}
              onChange={(e) => setEstimatedReach(e.target.value)}
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolioLinks">Portfolio Links</Label>
            <Textarea
              id="portfolioLinks"
              placeholder="Add links to your best work (one per line)"
              value={portfolioLinks}
              onChange={(e) => setPortfolioLinks(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}