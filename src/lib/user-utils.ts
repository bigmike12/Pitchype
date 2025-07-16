import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Utility functions for user role management and routing
 */

/**
 * Get the correct dashboard path for a user role
 */
export function getDashboardPath(userRole: UserRole): string {
  switch (userRole) {
    case 'business':
      return '/business';
    case 'influencer':
      return '/influencer';
    case 'admin':
      return '/admin';
    default:
      return '/onboarding';
  }
}

/**
 * Check if a user has access to a specific path based on their role
 */
export function hasAccessToPath(userRole: UserRole, pathname: string): boolean {
  // Handle both old paths and new dashboard route group paths
  if ((pathname.startsWith('/business') || pathname.startsWith('/(dashboard)/business')) && userRole !== 'business') {
    return false;
  }
  if ((pathname.startsWith('/influencer') || pathname.startsWith('/(dashboard)/influencer')) && userRole !== 'influencer') {
    return false;
  }
  if ((pathname.startsWith('/admin') || pathname.startsWith('/(dashboard)/admin')) && userRole !== 'admin') {
    return false;
  }
  return true;
}

/**
 * Ensure user profile exists, creating it if necessary
 */
export async function ensureUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  userEmail: string,
  userMetadata: any
): Promise<{ user_role: UserRole } | null> {
  // First try to get existing profile with retry logic
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }
    
    // If profile doesn't exist, break and create it
    if (error && error.code === 'PGRST116') {
      break;
    }
    
    // For other errors, retry
    retryCount++;
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
    }
  }

  // Profile doesn't exist, create it
  const userRole = (userMetadata?.user_role as UserRole) || 'influencer';
  
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      user_role: userRole,
      email: userEmail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('user_role')
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  // Create role-specific profile
  try {
    if (userRole === 'influencer') {
      await supabase.from('influencer_profiles').insert({
        id: userId,
        first_name: userMetadata?.first_name || '',
        last_name: userMetadata?.last_name || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } else if (userRole === 'business') {
      await supabase.from('business_profiles').insert({
        id: userId,
        first_name: userMetadata?.first_name || '',
        last_name: userMetadata?.last_name || '',
        company_name: userMetadata?.company_name || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  } catch (roleProfileError) {
    console.error('Error creating role-specific profile:', roleProfileError);
    // Don't fail the whole process if role-specific profile creation fails
  }

  return newProfile;
}

/**
 * Validate and normalize user role
 */
export function validateUserRole(role: any): UserRole {
  const validRoles: UserRole[] = ['business', 'influencer', 'admin'];
  return validRoles.includes(role) ? role : 'influencer';
}