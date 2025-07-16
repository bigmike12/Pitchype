import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { Database } from '@/types/database';

type PlatformSetting = Database['public']['Tables']['platform_settings']['Row'];
type PlatformSettingInsert = Database['public']['Tables']['platform_settings']['Insert'];
type PlatformSettingUpdate = Database['public']['Tables']['platform_settings']['Update'];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const settingKey = searchParams.get('key');

    let query = supabase
      .from('platform_settings')
      .select('*')
      .order('setting_key');

    if (settingKey) {
      query = query.eq('setting_key', settingKey);
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('Platform settings fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch platform settings' }, { status: 500 });
    }

    // If requesting a single setting, return just that value
    if (settingKey && settings && settings.length > 0) {
      return NextResponse.json({ setting: settings[0] });
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Platform settings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create platform settings' }, { status: 403 });
    }

    const body = await request.json();
    const { settingKey, settingValue, description } = body;

    if (!settingKey || settingValue === undefined) {
      return NextResponse.json(
        { error: 'Setting key and value are required' },
        { status: 400 }
      );
    }

    // Create new setting
    const { data: setting, error: createError } = await supabase
      .from('platform_settings')
      .insert({
        setting_key: settingKey,
        setting_value: settingValue,
        description: description || null
      } as PlatformSettingInsert)
      .select()
      .single();

    if (createError) {
      console.error('Platform setting creation error:', createError);
      if (createError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Setting key already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create platform setting' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      setting,
      message: 'Platform setting created successfully'
    });

  } catch (error) {
    console.error('Platform settings POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update platform settings' }, { status: 403 });
    }

    const body = await request.json();
    const { settingKey, settingValue, description } = body;

    if (!settingKey || settingValue === undefined) {
      return NextResponse.json(
        { error: 'Setting key and value are required' },
        { status: 400 }
      );
    }

    // Update existing setting
    const updateData: PlatformSettingUpdate = {
      setting_value: settingValue,
      updated_at: new Date().toISOString()
    };

    if (description !== undefined) {
      updateData.description = description;
    }

    const { data: setting, error: updateError } = await supabase
      .from('platform_settings')
      .update(updateData)
      .eq('setting_key', settingKey)
      .select()
      .single();

    if (updateError) {
      console.error('Platform setting update error:', updateError);
      return NextResponse.json({ error: 'Failed to update platform setting' }, { status: 500 });
    }

    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      setting,
      message: 'Platform setting updated successfully'
    });

  } catch (error) {
    console.error('Platform settings PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete platform settings' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const settingKey = searchParams.get('key');

    if (!settingKey) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      );
    }

    // Delete setting
    const { error: deleteError } = await supabase
      .from('platform_settings')
      .delete()
      .eq('setting_key', settingKey);

    if (deleteError) {
      console.error('Platform setting deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete platform setting' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Platform setting deleted successfully'
    });

  } catch (error) {
    console.error('Platform settings DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}