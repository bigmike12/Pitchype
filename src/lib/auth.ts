import { Database } from '@/types/database'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserProfile() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Error getting profile:', profileError)
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function requireUserType(userType: 'business' | 'influencer' | 'admin') {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/login')
  }
  
  if (profile.user_role !== userType) {
    redirect('/unauthorized')
  }
  
  return profile
}

export async function getBusinessProfile() {
  const profile = await requireUserType('business')
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data: business, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', profile.id)
    .single()
  
  if (error) {
    console.error('Error getting business profile:', error)
    return null
  }
  
  return { profile, business }
}

export async function getInfluencerProfile() {
  const profile = await requireUserType('influencer')
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data: influencer, error } = await supabase
    .from('influencer_profiles')
    .select('*')
    .eq('id', profile.id)
    .single()
  
  if (error) {
    console.error('Error getting influencer profile:', error)
    return null
  }
  
  return { profile, influencer }
}

export async function signOut() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
  
  redirect('/login')
}