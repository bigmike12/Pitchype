import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/server';

export async function POST(request: NextRequest) {
  try {
    // Create service role client that bypasses RLS
    const supabase = createServiceRoleClient();

    console.log('Running migration to add revision_requested to application_status enum...');

    // Check current applications table structure
    const { data: testData, error: testError } = await supabase
      .from('applications')
      .select('status')
      .limit(1);

    if (testError) {
      console.error('Error accessing applications table:', testError);
      return NextResponse.json({ 
        error: 'Could not access applications table', 
        details: testError 
      }, { status: 500 });
    }

    // Try to execute the migration SQL
    const migrationSQL = `
      -- Add missing values to the application_status enum
      DO $$
      BEGIN
        -- Add revision_requested if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'revision_requested' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'application_status')) THEN
          ALTER TYPE application_status ADD VALUE 'revision_requested';
        END IF;
        
        -- Add completed if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'application_status')) THEN
          ALTER TYPE application_status ADD VALUE 'completed';
        END IF;
        
        -- Add in_review if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_review' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'application_status')) THEN
          ALTER TYPE application_status ADD VALUE 'in_review';
        END IF;
      END
      $$;
      
      -- Update any invalid statuses to pending
      UPDATE applications 
      SET status = 'pending' 
      WHERE status NOT IN ('pending', 'approved', 'rejected', 'withdrawn', 'revision_requested', 'completed', 'in_review');
    `;

    // Execute the migration using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('Migration failed with exec_sql:', error);
      
      // Try alternative approach - direct query execution
      try {
        // This might work if the database supports it
        const { error: directError } = await supabase
          .from('applications')
          .update({ status: 'pending' })
          .eq('status', 'invalid_status_that_does_not_exist'); // This won't match anything but tests the connection
        
        return NextResponse.json({ 
          message: 'Migration partially completed. Please run the following SQL manually in your Supabase SQL editor:',
          sql: [
            "ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'revision_requested';",
            "ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'completed';",
            "ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'in_review';",
            "UPDATE applications SET status = 'pending' WHERE status NOT IN ('pending', 'approved', 'rejected', 'withdrawn', 'revision_requested', 'completed', 'in_review');"
          ],
          error: error
        });
      } catch (directError) {
        return NextResponse.json({ 
          error: 'Migration failed', 
          details: error,
          directError 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      message: 'Migration completed successfully!',
      result: data 
    });

  } catch (err) {
    console.error('Error running migration:', err);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: err 
    }, { status: 500 });
  }
}