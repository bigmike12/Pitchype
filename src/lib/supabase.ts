import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Note: Admin client moved to server-side API routes for security
// Server-side operations should use their own admin client instance

// Auth helpers
// export const signUp = async (email: string, password: string, userData: any) => {
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: userData
//     }
//   })
//   return { data, error }
// }

// export const signIn = async (email: string, password: string) => {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password
//   })
//   return { data, error }
// }

// export const signOut = async () => {
//   const { error } = await supabase.auth.signOut()
//   return { error }
// }

// export const getCurrentUser = async () => {
//   const { data: { user }, error } = await supabase.auth.getUser()
//   return { user, error }
// }

// export const resetPassword = async (email: string) => {
//   const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
//     redirectTo: `${window.location.origin}/auth/reset-password`
//   })
//   return { data, error }
// }

// Admin helper functions for user creation (bypasses RLS)
// User profile creation moved to server-side API route: /api/auth/signup
// This ensures proper security and admin privileges