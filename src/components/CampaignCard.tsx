'use client';

import React, { memo, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCampaignActions } from '@/hooks/useCampaignActions';
import { useApplicationStatus } from '@/hooks/useApplicationStatus';
import { ApplicationDialog } from '@/components/ApplicationDialog';
import { Calendar, DollarSign, Eye, Heart, Users, MapPin, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MotionDiv } from './performance/LazyMotion';

interface CampaignCardProps {
  campaign: any;
  onApply?: (campaignId: string) => void;
}

const CampaignCard = memo(function CampaignCard({ campaign, onApply }: CampaignCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorited, favoritesCount, viewCount, toggleFavorite, incrementViewCount } = useCampaignActions(campaign.id);
  const { applicationStatus, loading: checkingApplication } = useApplicationStatus({ campaignId: campaign.id });
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  const hasApplied = applicationStatus.hasApplied;

  const handleApplyClick = useCallback(() => {
    console.log('hasApplied', hasApplied);
    if (hasApplied) return;
    
    if (onApply) {
      onApply(campaign.id);
    } else {
      setIsApplicationDialogOpen(true);
    }
  }, [hasApplied, onApply, campaign.id]);

  const handleApplicationSubmitted = useCallback(() => {
    // Application status will be updated automatically by the hook
  }, []);

  const formattedBudget = useMemo(() => {
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
  }, [campaign.budget_min, campaign.budget_max]);

  const statusColor = useMemo(() => {
    switch (campaign.status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, [campaign.status]);

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {campaign.title.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-600">
                    {campaign.business?.company_name || 'Business'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={isFavorited ? 'text-red-500' : 'text-gray-400'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                {favoritesCount > 0 && (
                  <span className="ml-1 text-xs">{favoritesCount}</span>
                )}
              </Button>
              <Badge className={statusColor}>
                {campaign.status}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-lg">{campaign.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {campaign.description || 'No description available'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Budget and Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-semibold">{formattedBudget}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-semibold">
                  {campaign.application_deadline 
                    ? new Date(campaign.application_deadline).toLocaleDateString()
                    : 'TBD'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {campaign.minimum_followers && (
            <div>
              <p className="text-sm font-medium mb-2">Requirements</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {campaign.minimum_followers.toLocaleString()}+ followers
                </Badge>
              </div>
            </div>
          )}

          {/* Tags */}
          {campaign.tags && campaign.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {campaign.tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {campaign.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{campaign.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

           <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{campaign.required_influencers || 1} needed</span>
              </div>
            </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push(`/influencer/campaigns/${campaign.id}`)}
                className="flex-1"
              >
                View Details
              </Button>
              <Button 
                onClick={handleApplyClick}
                disabled={hasApplied || checkingApplication}
                className={hasApplied ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {checkingApplication ? (
                  'Checking...'
                ) : hasApplied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Applied
                  </>
                ) : (
                  'Apply Now'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ApplicationDialog
        isOpen={isApplicationDialogOpen}
        onClose={() => setIsApplicationDialogOpen(false)}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        onApplicationSubmitted={handleApplicationSubmitted}
      />
    </MotionDiv>
  );
});

export default CampaignCard;