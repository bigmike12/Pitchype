"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RefreshSessionButton() {
  const { refreshSession } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const { error } = await refreshSession();
      
      if (error) {
        toast.error(`Failed to refresh session: ${error.message}`);
      } else {
        toast.success("Session refreshed successfully!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while refreshing session");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      onClick={handleRefresh} 
      disabled={isRefreshing}
      variant="outline"
      size="sm"
    >
      {isRefreshing ? "Refreshing..." : "Refresh Session"}
    </Button>
  );
}