import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useDebounce } from '@/utils/performance'

interface BankDetails {
  id: string
  influencer_id: string
  bank_name: string
  account_holder_name: string
  account_number: string
  routing_number: string
  account_type: 'checking' | 'savings'
  country: string
  currency: string
  is_primary: boolean
  is_verified: boolean
  verification_status: 'pending' | 'verified' | 'rejected'
  created_at: string
  updated_at: string
}

interface PayoutRequest {
  id: string
  influencer_id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  bank_details_id: string
  transaction_id?: string
  admin_notes?: string
  processed_at?: string
  created_at: string
  updated_at: string
  bank_details?: BankDetails
}

interface InfluencerBalance {
  id: string
  influencer_id: string
  available_balance: number
  pending_balance: number
  total_earned: number
  total_withdrawn: number
  last_updated: string
}

interface UseFinancialsOptions {
  influencerId?: string
  status?: string
  limit?: number
}

// Shared abort controller utility
const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const createNewController = useCallback(() => {
    // Only abort if there's an existing controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    return abortControllerRef.current
  }, [])

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { createNewController, cleanup }
}

// Shared API utilities
const createApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`)
  }

  return data
}

const handleError = (err: unknown, defaultMessage: string) => {
  if (err instanceof Error && err.name === 'AbortError') {
    return null // Don't show abort errors
  }
  
  const errorMessage = err instanceof Error ? err.message : defaultMessage
  console.error(defaultMessage, err)
  return errorMessage
}

// Main financial hook with comprehensive functionality
export function useFinancials(options: UseFinancialsOptions = {}) {
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [balance, setBalance] = useState<InfluencerBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const { createNewController, cleanup } = useAbortController()

  // Memoize the target influencer ID to prevent unnecessary re-renders
  const targetInfluencerId = useMemo(() => 
    options.influencerId || user?.id, 
    [options.influencerId, user?.id]
  )

  // Internal fetch function without debouncing
  const fetchFinancialDataInternal = useCallback(async () => {
    try {
      const controller = createNewController()
      setLoading(true)
      setError(null)

      if (!targetInfluencerId) {
        // Reset data when no influencer ID is available
        setBankDetails([])
        setPayoutRequests([])
        setBalance(null)
        setLoading(false)
        return
      }

      // Build query parameters
      const params = new URLSearchParams({
        influencer_id: targetInfluencerId,
        ...(options.status && { status: options.status }),
        ...(options.limit && { limit: options.limit.toString() })
      })

      // Parallel fetch for better performance using API routes
      const [bankResult, payoutResult, balanceResult] = await Promise.allSettled([
        // Fetch bank details
        createApiRequest(`/api/bank-details?${params}`, {
          signal: controller.signal
        }),

        // Fetch payout requests with optional filtering
        createApiRequest(`/api/payouts?${params}`, {
          signal: controller.signal
        }),

        // Fetch balance
        createApiRequest(`/api/financials/balance?influencer_id=${targetInfluencerId}`, {
          signal: controller.signal
        })
      ])

      // Check if request was aborted
      if (controller.signal.aborted) return

      // Process results
      if (bankResult.status === 'fulfilled') {
        setBankDetails(bankResult.value.bankDetails || [])
      } else if (bankResult.status === 'rejected') {
        throw bankResult.reason
      }

      if (payoutResult.status === 'fulfilled') {
        setPayoutRequests(payoutResult.value.payoutRequests || [])
      } else if (payoutResult.status === 'rejected') {
        throw payoutResult.reason
      }

      if (balanceResult.status === 'fulfilled') {
        setBalance(balanceResult.value.balance || null)
      } else if (balanceResult.status === 'rejected') {
        throw balanceResult.reason
      }

    } catch (err) {
      const errorMessage = handleError(err, 'Failed to fetch financial data')
      if (errorMessage) setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [targetInfluencerId, options.status, options.limit])

  // Debounced version to prevent excessive API calls
  const fetchFinancialData = useDebounce(fetchFinancialDataInternal, 300)

  // Effect to trigger data fetching when dependencies change
  useEffect(() => {
    if (targetInfluencerId) {
      fetchFinancialData()
    }
  }, [targetInfluencerId, options.status, options.limit, fetchFinancialData])

  // Optimized mutation functions with optimistic updates
  const addBankDetails = useCallback(async (bankData: {
    bank_name: string
    account_holder_name: string
    account_number: string
    routing_number: string
    account_type: 'checking' | 'savings'
    is_primary?: boolean
  }) => {
    try {
      const data = await createApiRequest('/api/bank-details', {
        method: 'POST',
        body: JSON.stringify(bankData),
      })

      toast.success('Bank details added successfully')
      
      // Optimistic update
      setBankDetails(prev => [data.bankDetails, ...prev])
      
      return data.bankDetails
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add bank details'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const updateBankDetails = useCallback(async (
    id: string,
    updates: Partial<BankDetails>
  ) => {
    try {
      const data = await createApiRequest('/api/bank-details', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
      })

      toast.success('Bank details updated successfully')
      
      // Optimistic update
      setBankDetails(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
      
      return data.bankDetails
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bank details'
      toast.error(errorMessage)
      // Revert optimistic update on error
      await fetchFinancialData()
      throw err
    }
  }, [fetchFinancialData])

  const deleteBankDetails = useCallback(async (id: string) => {
    try {
      await createApiRequest('/api/bank-details', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })

      toast.success('Bank details deleted successfully')
      setBankDetails(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bank details'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const requestPayout = useCallback(async (payoutData: {
    amount: number
    bank_details_id: string
  }) => {
    try {
      const data = await createApiRequest('/api/payouts', {
        method: 'POST',
        body: JSON.stringify(payoutData),
      })

      toast.success('Payout request submitted successfully')
      
      // Optimistic update
      setPayoutRequests(prev => [data.payoutRequest, ...prev])
      
      return data.payoutRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request payout'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const updatePayoutStatus = useCallback(async (
    id: string,
    status: PayoutRequest['status'],
    adminNotes?: string,
    transactionId?: string
  ) => {
    try {
      const data = await createApiRequest('/api/payouts', {
        method: 'PATCH',
        body: JSON.stringify({
          id,
          status,
          admin_notes: adminNotes,
          transaction_id: transactionId,
        }),
      })

      toast.success(`Payout ${status} successfully`)
      
      // Optimistic update
      setPayoutRequests(prev => prev.map(p => 
        p.id === id ? { ...p, status, admin_notes: adminNotes, transaction_id: transactionId } : p
      ))
      
      return data.payoutRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payout'
      toast.error(errorMessage)
      // Revert optimistic update on error
      await fetchFinancialData()
      throw err
    }
  }, [fetchFinancialData])

  const cancelPayoutRequest = useCallback(async (id: string) => {
    try {
      await createApiRequest('/api/payouts', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })

      toast.success('Payout request cancelled successfully')
      setPayoutRequests(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel payout'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  // Initialize loading state properly
  useEffect(() => {
    if (!targetInfluencerId) {
      setLoading(false)
      setBankDetails([])
      setPayoutRequests([])
      setBalance(null)
      setError(null)
    } else {
      fetchFinancialData()
    }
    
    return cleanup
  }, [targetInfluencerId, fetchFinancialData, cleanup])

  // Memoized stats calculation
  const stats = useMemo(() => {
    const verifiedAccounts = bankDetails.filter(b => b.is_verified)
    const primaryAccount = bankDetails.find(b => b.is_primary)
    const pendingPayouts = payoutRequests.filter(p => p.status === 'pending')
    const completedPayouts = payoutRequests.filter(p => p.status === 'completed')
    const totalPayoutAmount = completedPayouts.reduce((sum, p) => sum + p.amount, 0)
    const recentPayouts = payoutRequests.slice(0, 5)

    return {
      totalBankAccounts: bankDetails.length,
      verifiedAccounts: verifiedAccounts.length,
      primaryAccount,
      availableBalance: balance?.available_balance || 0,
      pendingBalance: balance?.pending_balance || 0,
      totalEarned: balance?.total_earned || 0,
      totalWithdrawn: balance?.total_withdrawn || 0,
      pendingPayouts: pendingPayouts.length,
      completedPayouts: completedPayouts.length,
      totalPayoutAmount,
      recentPayouts,
    }
  }, [bankDetails, payoutRequests, balance])

  return {
    bankDetails,
    payoutRequests,
    balance,
    loading,
    error,
    stats,
    refetch: fetchFinancialData,
    addBankDetails,
    updateBankDetails,
    deleteBankDetails,
    requestPayout,
    updatePayoutStatus,
    cancelPayoutRequest,
  }
}

// Specialized hooks for specific use cases
export function useBankDetails(influencerId?: string) {
  const { bankDetails, loading, error, refetch } = useFinancials({ 
    influencerId,
    limit: undefined // Get all bank details
  })

  return {
    bankDetails,
    loading,
    error,
    refetch,
  }
}

export function usePayoutRequests(options: UseFinancialsOptions = {}) {
  const { payoutRequests, loading, error, refetch } = useFinancials(options)

  return {
    payoutRequests,
    loading,
    error,
    refetch,
  }
}

export function useInfluencerBalance(influencerId?: string) {
  const { balance, loading, error, refetch } = useFinancials({ 
    influencerId,
    limit: 1 // Only need balance, minimize other queries
  })

  return {
    balance,
    loading,
    error,
    refetch,
  }
}