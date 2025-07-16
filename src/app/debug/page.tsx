"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';

export default function DebugPage() {
  const { user, userProfile, loading } = useAuth();
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [dbError, setDbError] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      // Fetch profile directly from database
      const fetchDbProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            setDbError(error);
          } else {
            setDbProfile(data);
          }
        } catch (err) {
          setDbError(err);
        }
      };
      
      fetchDbProfile();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug User Profile</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Auth User (from Supabase Auth)</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">User Profile (from AuthContext)</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(userProfile, null, 2)}
          </pre>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Database Profile (direct query)</h2>
          {dbError ? (
            <div className="text-red-600">
              <strong>Error:</strong> {JSON.stringify(dbError, null, 2)}
            </div>
          ) : (
            <pre className="text-sm overflow-auto">
              {JSON.stringify(dbProfile, null, 2)}
            </pre>
          )}
        </div>
        
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Analysis</h2>
          <ul className="space-y-1 text-sm">
            <li><strong>User ID:</strong> {user?.id || 'Not found'}</li>
            <li><strong>Auth Role:</strong> {user?.role || 'Not found'}</li>
            <li><strong>User Metadata Role:</strong> {user?.user_metadata?.user_role || 'Not found'}</li>
            <li><strong>Profile Role (AuthContext):</strong> {userProfile?.user_role || 'Not found'}</li>
            <li><strong>Profile Role (Direct DB):</strong> {dbProfile?.user_role || 'Not found'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}