'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp, MessageSquare, Clock, Award, User, MoreHorizontal } from 'lucide-react';
import { useInfluencerReviews } from '@/hooks/useInfluencerReviews';
import { formatDistanceToNow } from 'date-fns';
import { MotionDiv } from '../performance/LazyMotion';

interface InfluencerReviewDisplayProps {
  influencerId: string;
  showCreateButton?: boolean;
  onCreateReview?: () => void;
  limit?: number;
}

interface ReviewItemProps {
  review: any;
  isOwner: boolean;
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: string) => void;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const CategoryRating = ({ 
  label, 
  rating, 
  icon 
}: { 
  label: string; 
  rating: number; 
  icon: React.ReactNode; 
}) => {
  if (!rating) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="text-gray-600">{label}:</span>
      <StarRating rating={rating} />
      <span className="text-gray-500">({rating})</span>
    </div>
  );
};

const ReviewItem = ({ review, isOwner, onEdit, onDelete }: ReviewItemProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={review.business?.avatar_url} />
              <AvatarFallback>
                {review.business?.company_name?.charAt(0) || 'B'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {review.business?.company_name || 'Business'}
                </span>
                <StarRating rating={review.rating} />
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              {review.title && (
                <h4 className="font-medium text-gray-900 mt-1">{review.title}</h4>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {review.would_work_again && (
              <Badge variant="secondary" className="text-xs">
                <ThumbsUp className="w-3 h-3 mr-1" />
                Would work again
              </Badge>
            )}
            {isOwner && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Review Text */}
        {review.review_text && (
          <p className="text-gray-700 text-sm leading-relaxed">
            {review.review_text}
          </p>
        )}

        {/* Category Ratings */}
        {(review.communication_rating || review.content_quality_rating || 
          review.professionalism_rating || review.timeliness_rating) && (
          <div className="space-y-1">
            {!showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                Show detailed ratings
              </Button>
            )}
            
            {showDetails && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 pt-2 border-t border-gray-100"
              >
                <CategoryRating
                  label="Communication"
                  rating={review.communication_rating}
                  icon={<MessageSquare className="w-3 h-3" />}
                />
                <CategoryRating
                  label="Content Quality"
                  rating={review.content_quality_rating}
                  icon={<Award className="w-3 h-3" />}
                />
                <CategoryRating
                  label="Professionalism"
                  rating={review.professionalism_rating}
                  icon={<User className="w-3 h-3" />}
                />
                <CategoryRating
                  label="Timeliness"
                  rating={review.timeliness_rating}
                  icon={<Clock className="w-3 h-3" />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
                >
                  Hide detailed ratings
                </Button>
              </MotionDiv>
            )}
          </div>
        )}

        {/* Campaign Info */}
        {review.campaign && (
          <div className="text-xs text-gray-500">
            Campaign: {review.campaign.title}
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

export default function InfluencerReviewDisplay({
  influencerId,
  showCreateButton = false,
  onCreateReview,
  limit
}: InfluencerReviewDisplayProps) {
  const { 
    reviews, 
    stats, 
    loading, 
    error, 
    refetch 
  } = useInfluencerReviews();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch reviews on component mount
  useState(() => {
    refetch();
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>Failed to load reviews</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredReviews = reviews.filter(review => review.influencer_id === influencerId);
  const reviewStats = stats;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Reviews
            {reviewStats && (
              <Badge variant="secondary">
                {reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          {showCreateButton && onCreateReview && (
            <Button onClick={onCreateReview} size="sm">
              Write Review
            </Button>
          )}
        </div>
        
        {reviewStats && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <StarRating rating={Math.round(reviewStats.averageRating)} size="md" />
              <span className="font-medium">{reviewStats.averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewStats.total})</span>
            </div>
            {reviewStats.wouldWorkAgainPercentage > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="w-3 h-3" />
                <span>{Math.round(reviewStats.wouldWorkAgainPercentage)}% would work again</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet</p>
            {showCreateButton && (
              <p className="text-sm mt-1">Be the first to leave a review!</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                isOwner={review.business_id === currentUserId}
              />
            ))}
            
            {limit && filteredReviews.length >= limit && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetch()}
                >
                  View All Reviews
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}