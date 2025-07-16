'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

interface PresenceCacheEntry {
  data: boolean;
  timestamp: number;
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useUserPresence() {
  const { user } = useAuth();
  const supabase = createClient();
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(true);
  const isMountedRef = useRef(true);
  const presenceCache = useRef<Map<string, PresenceCacheEntry>>(new Map());
  const pendingUpdates = useRef<Set<string>>(new Set());

  // Cache configuration
  const CACHE_TTL = 30000; // 30 seconds
  const PRESENCE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  // Optimized function to update user presence with request deduplication
  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user?.id || !isMountedRef.current) return;

    const updateKey = `${user.id}-${isOnline}`;
    
    // Prevent duplicate requests
    if (pendingUpdates.current.has(updateKey)) {
      return;
    }

    pendingUpdates.current.add(updateKey);

    try {
      const { error } = await supabase.rpc('update_user_presence', {
        user_uuid: user.id,
        online_status: isOnline
      });

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    } finally {
      pendingUpdates.current.delete(updateKey);
    }
  }, [user?.id, supabase]);

  // Debounced version for rapid state changes
  const debouncedUpdatePresence = useMemo(
    () => debounce(updatePresence, 1000),
    [updatePresence]
  );

  // Optimized function to get user presence with caching
  const getUserPresence = useCallback(async (userId: string): Promise<boolean> => {
    if (!isMountedRef.current) return false;

    // Check cache first
    const cached = presenceCache.current.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('is_online, last_seen')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      // Check if user is considered online
      const lastSeen = new Date(data.last_seen);
      const thresholdTime = new Date(Date.now() - PRESENCE_THRESHOLD);
      const isOnline = data.is_online && lastSeen > thresholdTime;

      // Cache the result
      presenceCache.current.set(userId, {
        data: isOnline,
        timestamp: Date.now()
      });

      return isOnline;
    } catch (error) {
      console.error('Error getting user presence:', error);
      return false;
    }
  }, [supabase, CACHE_TTL, PRESENCE_THRESHOLD]);

  // Optimized function to get multiple users' presence with batching
  const getMultipleUserPresence = useCallback(async (userIds: string[]): Promise<Record<string, boolean>> => {
    if (!isMountedRef.current || userIds.length === 0) return {};

    const presenceMap: Record<string, boolean> = {};
    const uncachedIds: string[] = [];

    // Check cache for each user
    userIds.forEach(userId => {
      const cached = presenceCache.current.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        presenceMap[userId] = cached.data;
      } else {
        uncachedIds.push(userId);
      }
    });

    // Fetch uncached users in batch
    if (uncachedIds.length > 0) {
      try {
        const { data, error } = await supabase
          .from('user_presence')
          .select('user_id, is_online, last_seen')
          .in('user_id', uncachedIds);

        if (error || !data) {
          // Return cached results for users we have, false for others
          uncachedIds.forEach(userId => {
            presenceMap[userId] = false;
          });
          return presenceMap;
        }

        const thresholdTime = new Date(Date.now() - PRESENCE_THRESHOLD);

        data.forEach((presence: UserPresence) => {
          const lastSeen = new Date(presence.last_seen);
          const isOnline = presence.is_online && lastSeen > thresholdTime;
          
          presenceMap[presence.user_id] = isOnline;
          
          // Cache the result
          presenceCache.current.set(presence.user_id, {
            data: isOnline,
            timestamp: Date.now()
          });
        });

        // Handle users not found in database
        uncachedIds.forEach(userId => {
          if (!(userId in presenceMap)) {
            presenceMap[userId] = false;
            presenceCache.current.set(userId, {
              data: false,
              timestamp: Date.now()
            });
          }
        });
      } catch (error) {
        console.error('Error getting multiple user presence:', error);
        // Set false for uncached users
        uncachedIds.forEach(userId => {
          presenceMap[userId] = false;
        });
      }
    }

    return presenceMap;
  }, [supabase, CACHE_TTL, PRESENCE_THRESHOLD]);

  // Synchronous cleanup function to avoid memory leaks
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }

    // Clear cache
    presenceCache.current.clear();
    pendingUpdates.current.clear();

    // Attempt to send offline status synchronously if possible
    if (user?.id && navigator.sendBeacon) {
      try {
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('online_status', 'false');
        navigator.sendBeacon('/api/presence', formData);
      } catch (error) {
        console.error('Error sending offline beacon:', error);
      }
    }
  }, [user?.id]);

  // Set up presence tracking
  useEffect(() => {
    if (!user?.id) return;

    isMountedRef.current = true;

    // Set initial online status
    updatePresence(true);

    // Set up heartbeat to maintain online status
    heartbeatInterval.current = setInterval(() => {
      if (isOnlineRef.current && isMountedRef.current) {
        updatePresence(true);
      }
    }, 30000); // Update every 30 seconds

    // Optimized event handlers
    const handleVisibilityChange = () => {
      if (!isMountedRef.current) return;
      
      const isVisible = !document.hidden;
      isOnlineRef.current = isVisible;
      
      // Use debounced version for rapid changes
      debouncedUpdatePresence(isVisible);
    };

    const handleFocus = () => {
      if (!isMountedRef.current) return;
      
      isOnlineRef.current = true;
      debouncedUpdatePresence(true);
    };

    const handleBlur = () => {
      if (!isMountedRef.current) return;
      
      isOnlineRef.current = false;
      debouncedUpdatePresence(false);
    };

    // Enhanced beforeunload handler with fallbacks
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isMountedRef.current || !user?.id) return;
      
      isOnlineRef.current = false;
      
      // Try multiple approaches for reliability
      if (navigator.sendBeacon) {
        try {
          const formData = new FormData();
          formData.append('user_id', user.id);
          formData.append('online_status', 'false');
          navigator.sendBeacon('/api/presence', formData);
        } catch (error) {
          console.error('Error sending offline beacon:', error);
        }
      }
      
      // Fallback: try synchronous update (may not work in all browsers)
      try {
        updatePresence(false);
      } catch (error) {
        console.error('Error updating presence on beforeunload:', error);
      }
    };

    // Enhanced pagehide handler (better than beforeunload on mobile)
    const handlePageHide = () => {
      if (!isMountedRef.current || !user?.id) return;
      
      isOnlineRef.current = false;
      
      if (navigator.sendBeacon) {
        try {
          const formData = new FormData();
          formData.append('user_id', user.id);
          formData.append('online_status', 'false');
          navigator.sendBeacon('/api/presence', formData);
        } catch (error) {
          console.error('Error sending offline beacon on pagehide:', error);
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup function
    return () => {
      // Remove event listeners first
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      
      // Then cleanup resources
      cleanup();
    };
  }, [user?.id, updatePresence, debouncedUpdatePresence, cleanup]);

  // Cache cleanup interval
  useEffect(() => {
    const cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      const entries = Array.from(presenceCache.current.entries());
      
      entries.forEach(([userId, entry]) => {
        if (now - entry.timestamp > CACHE_TTL * 2) {
          presenceCache.current.delete(userId);
        }
      });
    }, CACHE_TTL);

    return () => clearInterval(cacheCleanupInterval);
  }, [CACHE_TTL]);

  return {
    updatePresence,
    getUserPresence,
    getMultipleUserPresence,
    // Expose cache control for advanced usage
    clearPresenceCache: () => presenceCache.current.clear(),
    getCacheStats: () => ({
      size: presenceCache.current.size,
      entries: Array.from(presenceCache.current.keys())
    })
  };
}