import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First get the base user data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Then get the profile data based on user role
    let profileData = null;
    if (userData.user_role === 'influencer') {
      const { data, error } = await supabase
        .from('influencer_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error) profileData = data;
    } else if (userData.user_role === 'business') {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error) profileData = data;
    }

    // Combine the data
    const profile = {
      ...userData,
      ...profileData
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      bio,
      location,
      website_url,
      companyName,
      companyDescription,
      industry,
    } = await request.json();

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (companyName !== undefined) updateData.company_name = companyName;
    if (bio !== undefined) updateData.bio = bio;
    if (website_url !== undefined) updateData.website_url = website_url;
    if (location !== undefined) updateData.location = location;
    if (companyDescription !== undefined) updateData.company_description = companyDescription;
    if (industry !== undefined) updateData.industry = industry;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // First get the user role
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user role:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user role' },
        { status: 500 }
      );
    }

    // Separate base user fields from profile-specific fields
    const baseUserFields = ['email'];
    const baseUpdates: any = {};
    const profileUpdates: any = {};

    Object.keys(updateData).forEach(key => {
      if (baseUserFields.includes(key)) {
        baseUpdates[key] = updateData[key];
      } else {
        profileUpdates[key] = updateData[key];
      }
    });

    let error = null;
    let updatedProfile = null;

    // Update base user table if needed
    if (Object.keys(baseUpdates).length > 0) {
      const { error: baseError } = await supabase
        .from('profiles')
        .update({ ...baseUpdates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (baseError) error = baseError;
    }

    // Update profile table if needed
    if (Object.keys(profileUpdates).length > 0 && !error) {
      const tableName = userData.user_role === 'influencer' ? 'influencer_profiles' : 'business_profiles';
      const { data: profile, error: profileError } = await supabase
        .from(tableName)
        .update({ ...profileUpdates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      
      if (profileError) {
        error = profileError;
      } else {
        updatedProfile = profile;
      }
    }

    if (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}