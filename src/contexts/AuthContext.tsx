"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/client";
import { Database } from "@/types/database";
import { validateUserRole } from '@/lib/user-utils';

type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authLoading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData: any
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshSession: () => Promise<{ error: any }>;
  retryProfileFetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  
  const supabase = createClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const profileFetchingRef = useRef(false);

  // Optimized profile fetching with single query using joins
  const fetchUserProfile = useCallback(async (userId: string, retryCount = 0): Promise<void> => {
    // Prevent concurrent fetches
    if (profileFetchingRef.current) {
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!mountedRef.current) return;

    profileFetchingRef.current = true;
    setProfileLoading(true);

    try {
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Set a timeout to prevent infinite loading
      timeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        if (mountedRef.current) {
          console.warn('Profile fetch timed out, setting loading to false');
          setLoading(false);
          setProfileLoading(false);
        }
      }, 10000); // 10 second timeout

      // Optimized single query with joins instead of multiple queries
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          influencer_profiles(*),
          business_profiles(*)
        `)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Error fetching user profile:", error);

        // If user doesn't exist yet and we haven't retried too many times, try again
        if (error.code === "PGRST116" && retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 3000); // Exponential backoff, max 3s
          setTimeout(() => {
            profileFetchingRef.current = false;
            fetchUserProfile(userId, retryCount + 1);
          }, delay);
          return;
        }

        throw error;
      }

      if (!data || !mountedRef.current) return;

      // Clear timeout on successful response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Flatten the joined data based on user role
      let combinedProfile: UserProfile;
      
      if (data.user_role === "influencer" && data.influencer_profiles) {
        combinedProfile = {
          ...data,
          ...data.influencer_profiles[0], // Take first (should be only one)
        };
      } else if (data.user_role === "business" && data.business_profiles) {
        combinedProfile = {
          ...data,
          ...data.business_profiles[0], // Take first (should be only one)
        };
      } else {
        combinedProfile = data;
      }

      if (mountedRef.current) {
        setUserProfile(combinedProfile);
      }

    } catch (error) {
      // Don't log error if request was aborted or component unmounted
      if (error instanceof Error && (error.name === 'AbortError' || !mountedRef.current)) {
        return;
      }
      
      console.error("Error fetching user profile:", error);
    } finally {
      profileFetchingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (mountedRef.current) {
        setLoading(false);
        setProfileLoading(false);
      }
    }
  }, [supabase]);

  // Retry function for manual profile refetch
  const retryProfileFetch = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        setAuthLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        if (mounted) {
          setAuthLoading(false);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.id);

      setUser(session?.user ?? null);

      if (session?.user) {
        // Reset profile loading state
        setProfileLoading(true);
        await fetchUserProfile(session.user.id);
      } else {
        if (mounted) {
          setUserProfile(null);
        }
      }

      if (mounted) {
        setAuthLoading(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      mountedRef.current = false;
      subscription.unsubscribe();
      
      // Cleanup any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [supabase, fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error };
    } finally {
      setAuthLoading(false);
    }
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, userData: any) => {
    try {
      setAuthLoading(true);
      const validatedUserType = validateUserRole(userData.userType);
      
      // Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName?.trim() || "",
            last_name: userData.lastName?.trim() || "",
            user_role: validatedUserType,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        return { error };
      }

      if (data.user) {
        // Use a transaction-like approach for data consistency
        const profileData = {
          id: data.user.id,
          user_role: validatedUserType,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const roleSpecificData = {
          id: data.user.id,
          first_name: userData.firstName?.trim() || "",
          last_name: userData.lastName?.trim() || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Insert into profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .insert(profileData);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          return { error: profileError };
        }

        // Insert into role-specific table
        if (validatedUserType === "influencer") {
          const { error: influencerError } = await supabase
            .from("influencer_profiles")
            .insert(roleSpecificData);

          if (influencerError) {
            console.error("Error creating influencer profile:", influencerError);
            return { error: influencerError };
          }
        } else if (validatedUserType === "business") {
          const { error: businessError } = await supabase
            .from("business_profiles")
            .insert({
              ...roleSpecificData,
              company_name: userData.companyName?.trim() || "",
            });

          if (businessError) {
            console.error("Error creating business profile:", businessError);
            return { error: businessError };
          }
        }

        // Fetch the complete profile after creation
        setTimeout(async () => {
          if (data.user) {
            await fetchUserProfile(data.user.id);
          }
        }, 500);
      }

      return { error: null };
    } catch (error) {
      console.error("Sign up error details:", error);
      return { error };
    } finally {
      setAuthLoading(false);
    }
  }, [supabase, fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      setAuthLoading(true);
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      
      // Clear any remaining session data from localStorage
      try {
        localStorage.removeItem('supabase.auth.token');
        const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1];
        if (projectRef) {
          localStorage.removeItem(`sb-${projectRef}-auth-token`);
        }
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if signOut fails, clear local state
      setUser(null);
      setUserProfile(null);
    } finally {
      setAuthLoading(false);
    }
  }, [supabase]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      return { error: new Error("No user logged in") };
    }

    try {
      setProfileLoading(true);
      
      // Separate base user fields from profile-specific fields
      const baseUserFields = ["email", "user_role"];
      const baseUpdates: any = {};
      const profileUpdates: any = {};

      Object.keys(updates).forEach((key) => {
        if (baseUserFields.includes(key)) {
          baseUpdates[key] = updates[key as keyof UserProfile];
        } else {
          profileUpdates[key] = updates[key as keyof UserProfile];
        }
      });

      let error = null;

      // Update base user table if needed
      if (Object.keys(baseUpdates).length > 0) {
        const { error: baseError } = await supabase
          .from("profiles")
          .update({ ...baseUpdates, updated_at: new Date().toISOString() })
          .eq("id", user.id);

        if (baseError) error = baseError;
      }

      // Update profile table if needed
      if (Object.keys(profileUpdates).length > 0 && !error) {
        const tableName =
          userProfile.user_role === "influencer"
            ? "influencer_profiles"
            : "business_profiles";
        const { error: profileError } = await supabase
          .from(tableName)
          .update({ ...profileUpdates, updated_at: new Date().toISOString() })
          .eq("id", user.id);

        if (profileError) error = profileError;
      }

      if (!error && userProfile && mountedRef.current) {
        setUserProfile({ ...userProfile, ...updates });
      }

      return { error };
    } catch (error) {
      console.error("Update profile error:", error);
      return { error };
    } finally {
      setProfileLoading(false);
    }
  }, [user, userProfile, supabase]);

  const refreshSession = useCallback(async () => {
    try {
      setAuthLoading(true);
      
      // Refresh the session with Supabase
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("❌ Error refreshing session:", error);
        return { error };
      }
      
      if (data.session?.user) {
        setUser(data.session.user);
        
        // Fetch updated user profile
        await fetchUserProfile(data.session.user.id);
        
        return { error: null };
      } else {
        setUser(null);
        setUserProfile(null);
        return { error: new Error("No session found") };
      }
    } catch (error) {
      console.error("❌ Refresh session error:", error);
      return { error };
    } finally {
      setAuthLoading(false);
    }
  }, [supabase, fetchUserProfile]);

  const value = {
    user,
    userProfile,
    loading,
    authLoading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession,
    retryProfileFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Error boundary component for auth-related errors
export class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<any> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultAuthErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Default fallback component
const DefaultAuthErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
      <p className="text-gray-600 mb-4">
        Something went wrong with authentication. Please try refreshing the page.
      </p>
      {error && (
        <details className="text-left text-sm text-gray-500">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded">{error.message}</pre>
        </details>
      )}
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Page
      </button>
    </div>
  </div>
);