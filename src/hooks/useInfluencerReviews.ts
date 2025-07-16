import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface InfluencerReview {
  id: string
  campaign_id: string
  business_id: string
  influencer_id: string
  application_id: string
  rating: number
  title?: string
  review_text?: string
  communication_rating?: number
  content_quality_rating?: number
  professionalism_rating?: number
  timeliness_rating?: number
  would_work_again: boolean
  is_public: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  campaign?: {
    id: string
    title: string
    budget?: number
  }
  business?: {
    id: string
    business_profiles: {
      company_name: string
      logo_url?: string
    }
  }
  influencer?: {
    id: string
    influencer_profiles: {
      first_name: string
      last_name: string
      avatar_url?: string
      username?: string
    }
  }
}

interface ReviewFormData {
  campaign_id: string
  influencer_id: string
  application_id: string
  rating: number
  title?: string
  review_text?: string
  communication_rating?: number
  content_quality_rating?: number
  professionalism_rating?: number
  timeliness_rating?: number
  would_work_again?: boolean
  is_public?: boolean
}

interface UseInfluencerReviewsOptions {
  influencerId?: string
  businessId?: string
  campaignId?: string
  isPublic?: boolean
  limit?: number
  offset?: number
}

export function useInfluencerReviews(options: UseInfluencerReviewsOptions = {}) {
  const [reviews, setReviews] = useState<InfluencerReview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.influencerId) params.append('influencerId', options.influencerId)
      if (options.businessId) params.append('businessId', options.businessId)
      if (options.campaignId) params.append('campaignId', options.campaignId)
      if (options.isPublic !== undefined) params.append('isPublic', options.isPublic.toString())
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())

      const response = await fetch(`/api/influencer-reviews?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews')
      }

      setReviews(data.reviews || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [options.influencerId, options.businessId, options.campaignId, options.isPublic, options.limit, options.offset])

  const createReview = async (reviewData: ReviewFormData) => {
    try {
      const response = await fetch('/api/influencer-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create review')
      }

      toast.success('Review submitted successfully')
      await fetchReviews()
      return data.review
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create review'
      toast.error(errorMessage)
      throw err
    }
  }

  const updateReview = async (reviewId: string, updateData: Partial<ReviewFormData>) => {
    try {
      const response = await fetch(`/api/influencer-reviews?id=${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update review')
      }

      toast.success('Review updated successfully')
      await fetchReviews()
      return data.review
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review'
      toast.error(errorMessage)
      throw err
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/influencer-reviews?id=${reviewId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete review')
      }

      toast.success('Review deleted successfully')
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review'
      toast.error(errorMessage)
      throw err
    }
  }

  // Calculate review statistics
  const stats = {
    total: reviews.length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0,
    ratingDistribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    },
    wouldWorkAgainPercentage: reviews.length > 0
      ? (reviews.filter(r => r.would_work_again).length / reviews.length) * 100
      : 0,
    averageCategoryRatings: {
      communication: reviews.length > 0
        ? reviews.filter(r => r.communication_rating).reduce((sum, r) => sum + (r.communication_rating || 0), 0) / reviews.filter(r => r.communication_rating).length
        : 0,
      contentQuality: reviews.length > 0
        ? reviews.filter(r => r.content_quality_rating).reduce((sum, r) => sum + (r.content_quality_rating || 0), 0) / reviews.filter(r => r.content_quality_rating).length
        : 0,
      professionalism: reviews.length > 0
        ? reviews.filter(r => r.professionalism_rating).reduce((sum, r) => sum + (r.professionalism_rating || 0), 0) / reviews.filter(r => r.professionalism_rating).length
        : 0,
      timeliness: reviews.length > 0
        ? reviews.filter(r => r.timeliness_rating).reduce((sum, r) => sum + (r.timeliness_rating || 0), 0) / reviews.filter(r => r.timeliness_rating).length
        : 0,
    }
  }

  return {
    reviews,
    loading,
    error,
    stats,
    reviewStats: stats, // Alias for backward compatibility
    refetch: fetchReviews,
    fetchReviews: fetchReviews, // Alias for backward compatibility
    createReview,
    updateReview,
    deleteReview,
    canCreateReview: async (campaignId: string, influencerId: string) => {
      // Check if user can create a review for this campaign/influencer
      try {
        const response = await fetch(`/api/influencer-reviews?campaignId=${campaignId}&influencerId=${influencerId}`);
        const data = await response.json();
        
        return !(data.reviews && data.reviews.length > 0); // Can create if no existing review
      } catch {
        return true; // Allow creation if check fails
      }
    }
  }
}

// Hook for checking if a review can be created for a specific campaign/influencer
export function useCanCreateReview(campaignId: string, influencerId: string) {
  const [canCreate, setCanCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existingReview, setExistingReview] = useState<InfluencerReview | null>(null)

  useEffect(() => {
    const checkReviewEligibility = async () => {
      try {
        setLoading(true)
        
        // Check if review already exists
        const response = await fetch(`/api/influencer-reviews?campaignId=${campaignId}&influencerId=${influencerId}`)
        const data = await response.json()
        
        if (response.ok && data.reviews && data.reviews.length > 0) {
          setExistingReview(data.reviews[0])
          setCanCreate(false)
        } else {
          setExistingReview(null)
          setCanCreate(true)
        }
      } catch (err) {
        console.error('Error checking review eligibility:', err)
        setCanCreate(false)
      } finally {
        setLoading(false)
      }
    }

    if (campaignId && influencerId) {
      checkReviewEligibility()
    }
  }, [campaignId, influencerId])

  return {
    canCreate,
    loading,
    existingReview
  }
}