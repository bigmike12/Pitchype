import { useState, useEffect, useCallback } from "react";
import { Database } from "@/types/database";
import { createClient } from "@/lib/client";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  business?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
  };
  applications?: Array<{
    id: string;
    status: string;
    influencer?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    };
  }>;
};

interface UseCampaignsOptions {
  status?: string;
  businessId?: string;
  page?: number;
  limit?: number;
}

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.append("status", options.status);
      if (options.businessId) params.append("businessId", options.businessId);
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());

      const response = await fetch(`/api/campaigns?${params.toString()}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch campaigns");
      }

      setCampaigns(data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [options.status, options.businessId, options.page, options.limit]);

  useEffect(() => {
    fetchCampaigns();
  }, [options.status, options.businessId, options.page, options.limit]);

  const createCampaign = async (campaignData: Partial<Campaign>) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No active session");
    }

    try {

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This ensures cookies are sent
        body: JSON.stringify(campaignData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      // Refresh campaigns list
      await fetchCampaigns();
      return data.campaign;
    } catch (err) {
      console.error("Error in createCampaign:", err);
      throw err;
    }
  };

  const updateCampaign = async (
    id: string,
    campaignData: Partial<Campaign>
  ) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(campaignData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update campaign");
      }

      // Update local state
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === id ? { ...campaign, ...data.campaign } : campaign
        )
      );

      return data.campaign;
    } catch (err) {
      throw err;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete campaign");
      }

      // Remove from local state
      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch campaign");
      }

      setCampaign(data.campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign,
  };
}
