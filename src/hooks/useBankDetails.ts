'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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

interface BankDetail {
  id?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code: string;
}

interface UseBankDetailsReturn {
  banks: Bank[];
  bankDetails: BankDetail[];
  isLoading: boolean;
  isSubmitting: boolean;
  fetchBanks: () => Promise<void>;
  fetchBankDetails: () => Promise<void>;
  submitBankDetails: (data: Omit<BankDetail, 'id'>) => Promise<void>;
  updateBankDetails: (id: string, data: Omit<BankDetail, 'id'>) => Promise<void>;
  deleteBankDetails: (id: string) => Promise<void>;
}

export function useBankDetails(): UseBankDetailsReturn {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.paystack.co/bank', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch banks');
      }

      const data = await response.json();
      setBanks(data.data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to load banks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBankDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bank-details');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bank details');
      }

      const data = await response.json();
      setBankDetails(data.bankDetails || []);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      toast.error('Failed to load bank details');
    } finally {
      setIsLoading(false);
    }
  };

  const submitBankDetails = async (data: Omit<BankDetail, 'id'>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save bank details');
      }

      const result = await response.json();
      setBankDetails(prev => [...prev, result.bankDetail]);
      toast.success('Bank details saved successfully!');
    } catch (error) {
      console.error('Error saving bank details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save bank details';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBankDetails = async (id: string, data: Omit<BankDetail, 'id'>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bank-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update bank details');
      }

      const result = await response.json();
      setBankDetails(prev => prev.map(detail => 
        detail.id === id ? result.bankDetail : detail
      ));
      toast.success('Bank details updated successfully!');
    } catch (error) {
      console.error('Error updating bank details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bank details';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBankDetails = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bank-details', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bank details');
      }

      setBankDetails(prev => prev.filter(detail => detail.id !== id));
      toast.success('Bank details deleted successfully!');
    } catch (error) {
      console.error('Error deleting bank details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete bank details';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    banks,
    bankDetails,
    isLoading,
    isSubmitting,
    fetchBanks,
    fetchBankDetails,
    submitBankDetails,
    updateBankDetails,
    deleteBankDetails,
  };
}