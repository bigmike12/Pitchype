import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

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

export function useFinancials(options: UseFinancialsOptions = {}) {
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [balance, setBalance] = useState<InfluencerBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchFinancialData = useCallback(async () => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      setLoading(true)
      setError(null)

      const influencerId = options.influencerId || user?.id
      if (!influencerId) {
        setLoading(false)
        return
      }

      // Check if request was aborted before starting
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      // Fetch bank details
      const { data: bankData, error: bankError } = await supabase
        .from('influencer_bank_details')
        .select('*')
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false })

      if (bankError) throw bankError

      // Check if request was aborted before continuing
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      // Fetch payout requests
      let payoutQuery = supabase
        .from('payout_requests')
        .select(`
          *,
          bank_details:influencer_bank_details(
            bank_name,
            account_holder_name,
            account_type
          )
        `)
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false })

      if (options.status) {
        payoutQuery = payoutQuery.eq('status', options.status)
      }

      if (options.limit) {
        payoutQuery = payoutQuery.limit(options.limit)
      }

      const { data: payoutData, error: payoutError } = await payoutQuery
      if (payoutError) throw payoutError

      // Check if request was aborted before continuing
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      // Fetch influencer balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('influencer_balances')
        .select('*')
        .eq('influencer_id', influencerId)
        .single()

      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError

      setBankDetails(bankData || [])
      setPayoutRequests(payoutData || [])
      setBalance(balanceData)
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial data'
      setError(errorMessage)
      console.error('Error fetching financial data:', err)
    } finally {
      setLoading(false)
    }
  }, [options.influencerId, options.status, options.limit, user?.id, supabase])

  const addBankDetails = async (bankData: {
    bank_name: string
    account_holder_name: string
    account_number: string
    routing_number: string
    account_type: 'checking' | 'savings'
    is_primary?: boolean
  }) => {
    try {
      const response = await fetch('/api/bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bankData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add bank details')
      }

      toast.success('Bank details added successfully')
      await fetchFinancialData()
      return data.bankDetails
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add bank details'
      toast.error(errorMessage)
      throw err
    }
  }

  const updateBankDetails = async (
    id: string,
    updates: Partial<BankDetails>
  ) => {
    try {
      const response = await fetch('/api/bank-details', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, ...updates }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update bank details')
      }

      toast.success('Bank details updated successfully')
      await fetchFinancialData()
      return data.bankDetails
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bank details'
      toast.error(errorMessage)
      throw err
    }
  }

  const deleteBankDetails = async (id: string) => {
    try {
      const response = await fetch('/api/bank-details', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete bank details')
      }

      toast.success('Bank details deleted successfully')
      setBankDetails(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bank details'
      toast.error(errorMessage)
      throw err
    }
  }

  const requestPayout = async (payoutData: {
    amount: number
    bank_details_id: string
  }) => {
    try {
      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payoutData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request payout')
      }

      toast.success('Payout request submitted successfully')
      await fetchFinancialData()
      return data.payoutRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request payout'
      toast.error(errorMessage)
      throw err
    }
  }

  const updatePayoutStatus = async (
    id: string,
    status: PayoutRequest['status'],
    adminNotes?: string,
    transactionId?: string
  ) => {
    try {
      const response = await fetch('/api/payouts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id,
          status,
          admin_notes: adminNotes,
          transaction_id: transactionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payout status')
      }

      toast.success(`Payout ${status} successfully`)
      await fetchFinancialData()
      return data.payoutRequest
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payout'
      toast.error(errorMessage)
      throw err
    }
  }

  const cancelPayoutRequest = async (id: string) => {
    try {
      const response = await fetch('/api/payouts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel payout request')
      }

      toast.success('Payout request cancelled successfully')
      setPayoutRequests(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel payout'
      toast.error(errorMessage)
      throw err
    }
  }

  useEffect(() => {
    fetchFinancialData()
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchFinancialData])

  // Calculate stats
  const stats = {
    totalBankAccounts: bankDetails.length,
    verifiedAccounts: bankDetails.filter(b => b.is_verified).length,
    primaryAccount: bankDetails.find(b => b.is_primary),
    availableBalance: balance?.available_balance || 0,
    pendingBalance: balance?.pending_balance || 0,
    totalEarned: balance?.total_earned || 0,
    totalWithdrawn: balance?.total_withdrawn || 0,
    pendingPayouts: payoutRequests.filter(p => p.status === 'pending').length,
    completedPayouts: payoutRequests.filter(p => p.status === 'completed').length,
    totalPayoutAmount: payoutRequests
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    recentPayouts: payoutRequests.slice(0, 5),
  }

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

export function useBankDetails(influencerId?: string) {
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchBankDetails = useCallback(async () => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      setLoading(true)
      setError(null)

      const targetId = influencerId || user?.id
      if (!targetId) {
        setLoading(false)
        return
      }

      // Check if request was aborted before starting
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      const { data, error } = await supabase
        .from('influencer_bank_details')
        .select('*')
        .eq('influencer_id', targetId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBankDetails(data || [])
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bank details'
      setError(errorMessage)
      console.error('Error fetching bank details:', err)
    } finally {
      setLoading(false)
    }
  }, [influencerId, user?.id, supabase])

  useEffect(() => {
    fetchBankDetails()
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchBankDetails])

  return {
    bankDetails,
    loading,
    error,
    refetch: fetchBankDetails,
  }
}

export function usePayoutRequests(options: UseFinancialsOptions = {}) {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchPayoutRequests = useCallback(async () => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      setLoading(true)
      setError(null)

      const influencerId = options.influencerId || user?.id
      if (!influencerId) {
        setLoading(false)
        return
      }

      // Check if request was aborted before starting
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      let query = supabase
        .from('payout_requests')
        .select(`
          *,
          bank_details:influencer_bank_details(
            bank_name,
            account_holder_name,
            account_type
          )
        `)
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query
      if (error) throw error
      setPayoutRequests(data || [])
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payout requests'
      setError(errorMessage)
      console.error('Error fetching payout requests:', err)
    } finally {
      setLoading(false)
    }
  }, [options.influencerId, options.status, options.limit, user?.id, supabase])

  useEffect(() => {
    fetchPayoutRequests()
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchPayoutRequests])

  return {
    payoutRequests,
    loading,
    error,
    refetch: fetchPayoutRequests,
  }
}

export function useInfluencerBalance(influencerId?: string) {
  const [balance, setBalance] = useState<InfluencerBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchBalance = useCallback(async () => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      setLoading(true)
      setError(null)

      const targetId = influencerId || user?.id
      if (!targetId) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('influencer_balances')
        .select('*')
        .eq('influencer_id', targetId)
        .single()
        // .abortSignal(abortControllerRef.current.signal)

      if (error && error.code !== 'PGRST116') throw error
      setBalance(data)
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance'
      setError(errorMessage)
      console.error('Error fetching balance:', err)
    } finally {
      setLoading(false)
    }
  }, [influencerId, user?.id, supabase])

  useEffect(() => {
    fetchBalance()
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchBalance])

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  }
}