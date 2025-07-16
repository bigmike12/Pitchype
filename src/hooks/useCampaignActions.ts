import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface CampaignActionsState {
  isFavorited: boolean;
  favoritesCount: number;
  viewCount: number;
  isLoading: boolean;
}

export function useCampaignActions(campaignId: string) {
  const [state, setState] = useState<CampaignActionsState>({
    isFavorited: false,
    favoritesCount: 0,
    viewCount: 0,
    isLoading: true
  });
  
  const viewCountedRef = useRef(false);

  // Fetch initial state
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        // Fetch favorites status
        const favoritesResponse = await fetch(`/api/campaigns/${campaignId}/favorites`, {
          credentials: 'include'
        });
        
        // Fetch view count
        const viewsResponse = await fetch(`/api/campaigns/${campaignId}/views`, {
          credentials: 'include'
        });

        if (favoritesResponse.ok && viewsResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          const viewsData = await viewsResponse.json();
          
          setState({
            isFavorited: favoritesData.isFavorited,
            favoritesCount: favoritesData.favoritesCount,
            viewCount: viewsData.view_count,
            isLoading: false
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching campaign actions state:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (campaignId) {
      fetchInitialState();
    }
  }, [campaignId]);

  const toggleFavorite = async () => {
    try {
      const method = state.isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/campaigns/${campaignId}/favorites`, {
        method,
        credentials: 'include'
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          isFavorited: !prev.isFavorited,
          favoritesCount: prev.isFavorited 
            ? prev.favoritesCount - 1 
            : prev.favoritesCount + 1
        }));
        
        toast.success(
          state.isFavorited 
            ? 'Campaign removed from favorites' 
            : 'Campaign added to favorites'
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const incrementViewCount = useCallback(async () => {
    if (viewCountedRef.current) return;
    
    try {
      viewCountedRef.current = true;
      const response = await fetch(`/api/campaigns/${campaignId}/views`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          viewCount: data.view_count
        }));
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
      viewCountedRef.current = false; // Reset on error to allow retry
    }
  }, [campaignId]);

  return {
    ...state,
    toggleFavorite,
    incrementViewCount
  };
}