"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PayoutRequest {
  id?: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  requested_at?: string;
  processed_at?: string;
  notes?: string;
}

interface Balance {
  available: number;
  pending: number;
  total: number;
}

interface PlatformSettings {
  minimum_payout_amount: number;
  payout_fee_percentage: number;
  payout_processing_days: number;
}

interface UsePayoutRequestsReturn {
  balance: Balance | null;
  payouts: PayoutRequest[];
  platformSettings: PlatformSettings | null;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchBalance: () => Promise<void>;
  fetchPayouts: () => Promise<void>;
  fetchPlatformSettings: () => Promise<void>;
  requestPayout: (amount: number) => Promise<void>;
}

export function usePayoutRequests(): UsePayoutRequestsReturn {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [platformSettings, setPlatformSettings] =
    useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/influencer/balance");

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();
      // Map the database field names to the expected interface
      if (data.balance) {
        setBalance({
          available: data.balance.available_balance || 0,
          pending: data.balance.pending_balance || 0,
          total: data.balance.total_earned || 0
        });
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to load balance");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/payouts");

      if (!response.ok) {
        throw new Error("Failed to fetch payouts");
      }

      const data = await response.json();
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to load payout history");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlatformSettings = async () => {
    try {
      const response = await fetch("/api/platform-settings");

      if (!response.ok) {
        throw new Error("Failed to fetch platform settings");
      }

      const data = await response.json();
      const settings = data.settings || [];

      // Extract relevant payout settings
      const payoutSettings: PlatformSettings = {
        minimum_payout_amount: parseFloat(
          settings.find((s: any) => s.setting_key === "transaction_fee_cap")
            ?.setting_value || "50"
        ),
        payout_fee_percentage: parseFloat(
          settings.find((s: any) => s.setting_key === "platform_fee_percentage")
            ?.setting_value || "2.5"
        ),
        payout_processing_days: parseInt(
          settings.find((s: any) => s.setting_key === "payout_processing_days")
            ?.setting_value || "3"
        ),
      };

      setPlatformSettings(payoutSettings);
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      // Set default values if fetch fails
      setPlatformSettings({
        minimum_payout_amount: 50,
        payout_fee_percentage: 2.5,
        payout_processing_days: 3,
      });
    }
  };

  const requestPayout = async (amount: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request payout");
      }

      const result = await response.json();
      setPayouts((prev) => [result.payout, ...prev]);

      // Update balance
      if (balance) {
        setBalance({
          ...balance,
          available: balance.available - amount,
          pending: balance.pending + amount,
        });
      }
      
      // Refresh balance from server to ensure accuracy
      await fetchBalance();

      toast.success("Payout request submitted successfully!");
    } catch (error) {
      console.error("Error requesting payout:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to request payout";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchPayouts();
    fetchPlatformSettings();
  }, []);

  return {
    balance,
    payouts,
    platformSettings,
    isLoading,
    isSubmitting,
    fetchBalance,
    fetchPayouts,
    fetchPlatformSettings,
    requestPayout,
  };
}
