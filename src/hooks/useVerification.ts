import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface SocialMediaVerification {
  id: string
  influencer_id: string
  platform: string
  username: string
  profile_url: string
  follower_count: number
  status: 'pending' | 'verified' | 'rejected'
  verification_status?: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

interface UseVerificationOptions {
  influencerId?: string
  platform?: string
  status?: string
}

export function useVerification(options: UseVerificationOptions = {}) {
  const [verifications, setVerifications] = useState<SocialMediaVerification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.influencerId) params.append('influencerId', options.influencerId)
      if (options.platform) params.append('platform', options.platform)
      if (options.status) params.append('status', options.status)

      const response = await fetch(`/api/social-media-verifications?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch verifications')
      }

      setVerifications(data.verifications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVerifications()
  }, [options.influencerId, options.platform, options.status])

  const submitVerification = async (verificationData: {
    platform: string
    username: string
    profile_url: string
    follower_count: number
    screenshot_url?: string
  }) => {
    try {
      const response = await fetch('/api/social-media-verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit verification')
      }

      toast.success('Verification request submitted successfully')
      await fetchVerifications()
      return data.verification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit verification'
      toast.error(errorMessage)
      throw err
    }
  }

  const updateVerificationStatus = async (
    id: string,
    status: 'verified' | 'rejected',
    adminNotes?: string
  ) => {
    try {
      const response = await fetch('/api/social-media-verifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          admin_notes: adminNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update verification status')
      }

      toast.success(`Verification ${status} successfully`)
      await fetchVerifications()
      return data.verification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update verification'
      toast.error(errorMessage)
      throw err
    }
  }

  const deleteVerification = async (id: string) => {
    try {
      const response = await fetch('/api/social-media-verifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete verification')
      }

      toast.success('Verification deleted successfully')
      setVerifications(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete verification'
      toast.error(errorMessage)
      throw err
    }
  }

  // Calculate stats
  const stats = {
    total: verifications.length,
    verified: verifications.filter(v => v.status === 'verified').length,
    pending: verifications.filter(v => v.status === 'pending').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
    totalFollowers: verifications
      .filter(v => v.status === 'verified')
      .reduce((sum, v) => sum + (v.follower_count || 0), 0),
    platforms: [...new Set(verifications.map(v => v.platform))],
  }

  // Calculate trust score
  const trustScore = Math.min(100, Math.round(
    (stats.verified * 25) + 
    (Math.min(stats.totalFollowers / 10000, 5) * 10) +
    (stats.total ? (stats.verified / stats.total) * 25 : 0)
  ))

  return {
    verifications,
    loading,
    error,
    stats: { ...stats, trustScore },
    refetch: fetchVerifications,
    submitVerification,
    updateVerificationStatus,
    deleteVerification,
  }
}

export function useVerificationById(id: string) {
  const [verification, setVerification] = useState<SocialMediaVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVerification = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/social-media-verifications/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch verification')
      }

      setVerification(data.verification)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchVerification()
    }
  }, [id])

  return {
    verification,
    loading,
    error,
    refetch: fetchVerification,
  }
}