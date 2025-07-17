'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useCampaignActions } from '@/hooks/useCampaignActions';
import { useCampaigns, useCampaign } from "@/hooks/useCampaigns";
import { useApplicationStatus } from '@/hooks/useApplicationStatus';
import { useSendMessage } from '@/hooks/useSendMessage';
import { ArrowLeft, Calendar, DollarSign, Eye, Heart, Users, MapPin, MessageCircle, Send, Building2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ApplicationModal from '@/components/ApplicationModal';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  budget_min: number | null;
  budget_max: number | null;
  minimum_followers: number | null;
  required_influencers: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  tags: string[] | null;
  deliverables: string[] | null;
  campaign_goals: string[] | null;
  created_at: string;
  business_id: string;
  business?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
    bio?: string;
    website_url?: string;
  };
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  // Use the existing useCampaign hook
  const { campaign, loading, error } = useCampaign(campaignId);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  // Use the new hooks for application status and sending messages
  const { applicationStatus, loading: applicationLoading, refetch: refetchApplicationStatus } = useApplicationStatus({ campaignId });
  const { sendMessage: sendMessageHook, sending: sendingMessage } = useSendMessage();
  
  const hasApplied = applicationStatus.hasApplied;
  
  const { isFavorited, favoritesCount, viewCount, toggleFavorite, incrementViewCount } = useCampaignActions(campaignId);

  // Increment view count when campaign is loaded
  useEffect(() => {
    if (campaign) {
      incrementViewCount();
    }
  }, [campaign]);

  // Application status is now handled by the useApplicationStatus hook

  const formatBudget = (campaign: Campaign) => {
    if (campaign.budget_min && campaign.budget_max) {
      if (campaign.budget_min === campaign.budget_max) {
        return `₦${campaign.budget_min.toLocaleString()}`;
      }
      return `₦${campaign.budget_min.toLocaleString()} - ₦${campaign.budget_max.toLocaleString()}`;
    }
    if (campaign.budget_min) {
      return `₦${campaign.budget_min.toLocaleString()}+`;
    }
    return 'Budget TBD';
  };

  const handleSendMessage = async () => {
    if (!hasApplied) {
      toast.error('You must apply to this campaign before sending a message');
      return;
    }

    if (!applicationStatus.applicationId) {
      toast.error('Application not found. Please apply to this campaign first.');
      return;
    }

    const result = await sendMessageHook({
      applicationId: applicationStatus.applicationId,
      content: message
    });

    if (result) {
      setMessage('');
    }
  };

  const handleApply = () => {
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = async () => {
    await refetchApplicationStatus();
    setShowApplicationModal(false);
    toast.success('Application submitted successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
      </div>

      {/* Campaign Details */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {campaign.business?.company_name || 
                         `${campaign.business?.first_name || ''} ${campaign.business?.last_name || ''}`.trim() || 
                         'Business'}
                      </h3>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2">{campaign.title}</CardTitle>
                  <CardDescription className="text-base">
                    {campaign.description || 'No description available'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    {viewCount}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold">{formatBudget(campaign)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Required</p>
                  <p className="font-semibold">{campaign.required_influencers || 'TBD'} influencers</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold">{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'TBD'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-semibold">{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'TBD'}</p>
                </div>
              </div>

              {/* Minimum Followers */}
              {campaign.minimum_followers && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Minimum Followers Required</h4>
                  <p className="text-blue-700">{campaign.minimum_followers.toLocaleString()} followers</p>
                </div>
              )}

              {/* Tags */}
              {campaign.tags && campaign.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {campaign.deliverables && campaign.deliverables.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Deliverables</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.deliverables.map((deliverable, index) => (
                      <Badge key={index} variant="outline">
                        {deliverable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {campaign.campaign_goals && campaign.campaign_goals.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Deliverables</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.campaign_goals.map((goals, index) => (
                      <Badge key={index} variant="outline">
                        {goals}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apply to Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasApplied ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-green-700">Application Submitted</p>
                  <p className="text-sm text-gray-600">You have successfully applied to this campaign.</p>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleApply}
                  disabled={campaign.status !== 'active'}
                >
                  Apply Now
                </Button>
              )}
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {favoritesCount} {favoritesCount === 1 ? 'influencer has' : 'influencers have'} favorited this campaign
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Message Business Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Message Business
              </CardTitle>
              <CardDescription>
                Have questions? Send a message to the business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={sendingMessage || !message.trim()}
                className="w-full"
              >
                {sendingMessage ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </MotionDiv>

      {/* Application Modal */}
       {campaign && (
         <ApplicationModal
           isOpen={showApplicationModal}
           onClose={() => setShowApplicationModal(false)}
           campaign={{
             id: campaign.id,
             title: campaign.title,
             description: campaign.description || 'No description available',
             budget_min: campaign.budget_min || undefined,
             budget_max: campaign.budget_max || undefined,
             minimum_followers: campaign.minimum_followers || undefined,
             required_influencers: campaign.required_influencers || 1,
             deliverables: campaign.deliverables || [],
             tags: campaign.tags || []
           }}
           businessEmail="business@pitchype.com"
           onSuccess={handleApplicationSuccess}
         />
       )}
    </div>
  );
}