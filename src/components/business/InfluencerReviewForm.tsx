'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Star, User, MessageSquare, Clock, Award, ThumbsUp } from 'lucide-react';
import { useInfluencerReviews } from '@/hooks/useInfluencerReviews';
import { toast } from 'sonner';
import { MotionDiv } from '../performance/LazyMotion';

interface InfluencerReviewFormProps {
  campaignId: string;
  influencerId: string;
  applicationId: string;
  influencerName: string;
  campaignTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface RatingCategory {
  key: 'communication_rating' | 'content_quality_rating' | 'professionalism_rating' | 'timeliness_rating';
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ratingCategories: RatingCategory[] = [
  {
    key: 'communication_rating',
    label: 'Communication',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'How well did the influencer communicate throughout the campaign?'
  },
  {
    key: 'content_quality_rating',
    label: 'Content Quality',
    icon: <Award className="w-4 h-4" />,
    description: 'How would you rate the quality of the content delivered?'
  },
  {
    key: 'professionalism_rating',
    label: 'Professionalism',
    icon: <User className="w-4 h-4" />,
    description: 'How professional was the influencer during the collaboration?'
  },
  {
    key: 'timeliness_rating',
    label: 'Timeliness',
    icon: <Clock className="w-4 h-4" />,
    description: 'Did the influencer meet deadlines and deliver on time?'
  }
];

const StarRating = ({ 
  rating, 
  onRatingChange, 
  size = 'md' 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className={`${sizeClasses[size]} transition-colors hover:scale-110 transform`}
        >
          <Star
            className={`w-full h-full ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function InfluencerReviewForm({
  campaignId,
  influencerId,
  applicationId,
  influencerName,
  campaignTitle,
  onSuccess,
  onCancel
}: InfluencerReviewFormProps) {
  const { createReview } = useInfluencerReviews();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    review_text: '',
    communication_rating: 0,
    content_quality_rating: 0,
    professionalism_rating: 0,
    timeliness_rating: 0,
    would_work_again: false,
    is_public: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    try {
      setLoading(true);
      
      await createReview({
        campaign_id: campaignId,
        influencer_id: influencerId,
        application_id: applicationId,
        rating: formData.rating,
        title: formData.title || undefined,
        review_text: formData.review_text || undefined,
        communication_rating: formData.communication_rating || undefined,
        content_quality_rating: formData.content_quality_rating || undefined,
        professionalism_rating: formData.professionalism_rating || undefined,
        timeliness_rating: formData.timeliness_rating || undefined,
        would_work_again: formData.would_work_again,
        is_public: formData.is_public
      });
      
      onSuccess?.();
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setLoading(false);
    }
  };

  const updateRating = (category: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Review {influencerName}
          </CardTitle>
          <CardDescription>
            Share your experience working with {influencerName} on "{campaignTitle}"
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Overall Rating *</Label>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={formData.rating}
                  onRatingChange={(rating) => updateRating('rating', rating)}
                  size="lg"
                />
                <span className="text-sm text-gray-600">
                  {formData.rating > 0 && (
                    <span className="font-medium">
                      {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Review Title</Label>
              <Input
                id="title"
                placeholder="Summarize your experience in a few words"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={100}
              />
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <Label htmlFor="review_text">Review Details</Label>
              <Textarea
                id="review_text"
                placeholder="Share details about your experience working with this influencer..."
                value={formData.review_text}
                onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.review_text.length}/1000 characters
              </div>
            </div>

            {/* Category Ratings */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Detailed Ratings</Label>
              <div className="grid gap-4">
                {ratingCategories.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="font-medium">{category.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <StarRating
                      rating={formData[category.key]}
                      onRatingChange={(rating) => updateRating(category.key, rating)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Would Work Again */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <div>
                  <Label className="font-medium">Would you work with {influencerName} again?</Label>
                  <p className="text-sm text-gray-600">This helps other businesses make informed decisions</p>
                </div>
              </div>
              <Switch
                checked={formData.would_work_again}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, would_work_again: checked }))}
              />
            </div>

            {/* Public Review */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <Label className="font-medium">Make this review public</Label>
                <p className="text-sm text-gray-600">Public reviews help the community and the influencer</p>
              </div>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || formData.rating === 0}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}