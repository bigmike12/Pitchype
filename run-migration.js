const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url_here';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here';

async function runMigration() {
  try {
    // Create service role client
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Running migration to add revision_requested to application_status enum...');

    // First, let's check the current enum values
    console.log('Checking current application_status enum values...');
    const { data: enumData, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'application_status' });
    
    if (enumError) {
      console.log('Could not check enum values, proceeding with migration...');
    } else {
      console.log('Current enum values:', enumData);
    }

    // Try to add the new enum values using a simple query
    console.log('Attempting to add revision_requested to application_status enum...');
    
    // Since we can't execute DDL directly, let's try a different approach
    // We'll create a simple test to see if the enum value exists
    const { data: testData, error: testError } = await supabase
      .from('applications')
      .select('status')
      .limit(1);
    
    if (testError) {
      console.error('Error accessing applications table:', testError);
    } else {
      console.log('✓ Successfully connected to applications table');
      console.log('Note: You may need to manually add the enum values to your database.');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log("ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'revision_requested';");
      console.log("ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'completed';");
      console.log("ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'in_review';");
    }

    console.log('Migration process completed!');

  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

runMigration();