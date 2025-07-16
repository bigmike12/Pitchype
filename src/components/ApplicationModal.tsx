'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Send, DollarSign, FileText, Link as LinkIcon, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';
import { useApplications, useApplicationManagement } from '@/hooks/useApplications';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    description: string;
    budget_min?: number;
    budget_max?: number;
    minimum_followers?: number;
    required_influencers: number;
    deliverables?: string[];
    tags?: string[];
  };
  businessEmail: string;
  onSuccess?: () => void;
}

interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  campaign,
  businessEmail,
  onSuccess
}: ApplicationModalProps) {
  const { createApplication } = useApplications();
  const {
    banks,
    isLoadingBanks: loadingBanks,
    fetchBanks,
  } = useApplicationManagement();
  
  const [formData, setFormData] = useState({
    proposal: '',
    proposed_rate: campaign.budget_max || 0,
    estimated_reach: '',
    portfolio_links: [''],
    bank_details: {
      account_holder_name: '',
      bank_name: '',
      account_number: '',
      bank_code: ''
    }
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Fetch banks from Paystack API
  useEffect(() => {
    if (isOpen) {
      fetchBanks();
    }
  }, [isOpen, fetchBanks]);

  const handleAddPortfolioLink = () => {
    setFormData({
      ...formData,
      portfolio_links: [...formData.portfolio_links, '']
    });
  };

  const handleRemovePortfolioLink = (index: number) => {
    const newLinks = formData.portfolio_links.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      portfolio_links: newLinks.length > 0 ? newLinks : ['']
    });
  };

  const handlePortfolioLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.portfolio_links];
    newLinks[index] = value;
    setFormData({
      ...formData,
      portfolio_links: newLinks
    });
  };

  const handleBankChange = (bankCode: string) => {
    const selectedBank = banks.find(bank => bank.code === bankCode);
    setFormData({
      ...formData,
      bank_details: {
        ...formData.bank_details,
        bank_name: selectedBank?.name || '',
        bank_code: bankCode
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.proposal.trim()) {
      toast.error('Please provide a proposal');
      return;
    }

    // if (!formData.bank_details.account_holder_name.trim() || 
    //     !formData.bank_details.account_number.trim() || 
    //     !formData.bank_details.bank_code) {
    //   toast.error('Please complete your bank details');
    //   return;
    // }

    setSubmitting(true);
    try {
      const applicationData = {
        campaign_id: campaign.id,
        proposal: formData.proposal,
        proposed_rate: formData.proposed_rate,
        estimated_reach: formData.estimated_reach ? parseInt(formData.estimated_reach) : undefined,
        portfolio_links: formData.portfolio_links.filter(link => link.trim()),
        bank_details: formData.bank_details
      };

      const data = await createApplication(applicationData);
      setApplicationId(data.application.id);
      toast.success('Application submitted successfully!');
      
      // Show payment modal
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (reference: string) => {
    toast.success('Payment completed successfully!');
    setShowPaymentModal(false);
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    // Don't close the main modal, allow user to try payment again
  };

  const handleModalClose = () => {
    if (!showPaymentModal) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showPaymentModal} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Apply to Campaign
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Campaign Summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {campaign.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span>Budget: {formatCurrency(campaign.budget_min || 0)} - {formatCurrency(campaign.budget_max || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Required: {campaign.required_influencers} influencers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Form */}
            <div className="space-y-4">
              {/* Proposal */}
              <div className="space-y-2">
                <Label htmlFor="proposal">Proposal *</Label>
                <Textarea
                  id="proposal"
                  placeholder="Describe why you're perfect for this campaign and how you plan to execute it..."
                  value={formData.proposal}
                  onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Proposed Rate */}
              <div className="space-y-2">
                <Label htmlFor="proposed_rate">Proposed Rate</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">₦</span>
                  <Input
                    id="proposed_rate"
                    type="number"
                    value={formData.proposed_rate}
                    onChange={(e) => setFormData({ ...formData, proposed_rate: parseInt(e.target.value) || 0 })}
                    min={campaign.budget_min || 0}
                    max={campaign.budget_max || 0}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    (₦{(campaign.budget_min || 0).toLocaleString()} - ₦{(campaign.budget_max || 0).toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Estimated Reach */}
              <div className="space-y-2">
                <Label htmlFor="estimated_reach">Estimated Reach</Label>
                <Input
                  id="estimated_reach"
                  type="number"
                  placeholder="Expected number of people who will see your content"
                  value={formData.estimated_reach}
                  onChange={(e) => setFormData({ ...formData, estimated_reach: e.target.value })}
                />
              </div>

              {/* Portfolio Links */}
              <div className="space-y-2">
                <Label>Portfolio Links</Label>
                {formData.portfolio_links.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://..."
                      value={link}
                      onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {formData.portfolio_links.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePortfolioLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPortfolioLink}
                  className="w-full"
                >
                  Add Portfolio Link
                </Button>
              </div>

              <Separator />

              {/* Bank Details */}
              {/* <div className="space-y-4">
                <h4 className="font-medium">Bank Details for Payments</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                    <Input
                      id="account_holder_name"
                      placeholder="Full name on account"
                      value={formData.bank_details.account_holder_name}
                      onChange={(e) => setFormData({
                        ...formData,
                        bank_details: {
                          ...formData.bank_details,
                          account_holder_name: e.target.value
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name *</Label>
                    <Select
                      value={formData.bank_details.bank_code}
                      onValueChange={handleBankChange}
                      disabled={loadingBanks}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingBanks ? "Loading banks..." : "Select bank"} />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="account_number">Account Number *</Label>
                    <Input
                      id="account_number"
                      placeholder="Account number"
                      value={formData.bank_details.account_number}
                      onChange={(e) => setFormData({
                        ...formData,
                        bank_details: {
                          ...formData.bank_details,
                          account_number: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div> */}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={submitting || loadingBanks}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {showPaymentModal && applicationId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          onSuccess={handlePaymentSuccess}
          campaignBudget={formData.proposed_rate}
          applicationId={applicationId}
          businessEmail={businessEmail}
        />
      )}
    </>
  );
}