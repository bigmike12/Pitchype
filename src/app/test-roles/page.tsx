'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath, hasAccessToPath, validateUserRole } from '@/lib/user-utils';
import { useState } from 'react';

export default function TestRolesPage() {
  const { user, userProfile, loading } = useAuth();
  const [testRole, setTestRole] = useState<string>('influencer');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const testPaths = [
    '/business',
    '/influencer', 
    '/admin',
    '/onboarding',
    '/auth/login'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Role System Test</h1>
        
        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current User Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Auth User</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>ID:</strong> {user?.id || 'Not logged in'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
                <p><strong>Metadata Role:</strong> {user?.user_metadata?.user_role || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">User Profile</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>User Role:</strong> {userProfile?.user_role || 'N/A'}</p>
                <p><strong>Email:</strong> {userProfile?.email || 'N/A'}</p>
                <p><strong>Created:</strong> {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Validation Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Role Validation Test</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Role Input:
            </label>
            <select 
              value={testRole} 
              onChange={(e) => setTestRole(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="influencer">influencer</option>
              <option value="business">business</option>
              <option value="admin">admin</option>
              <option value="invalid">invalid</option>
              <option value="">empty string</option>
              <option value={undefined}>undefined</option>
            </select>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>Validated Role:</strong> {validateUserRole(testRole)}</p>
            <p><strong>Dashboard Path:</strong> {getDashboardPath(validateUserRole(testRole) as any)}</p>
          </div>
        </div>

        {/* Path Access Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Path Access Test</h2>
          
          {userProfile?.user_role && (
            <div>
              <p className="mb-4">Testing access for role: <strong>{userProfile.user_role}</strong></p>
              
              <div className="space-y-2">
                {testPaths.map(path => (
                  <div key={path} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{path}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      hasAccessToPath(userProfile.user_role, path) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {hasAccessToPath(userProfile.user_role, path) ? 'ALLOWED' : 'BLOCKED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Utility Functions Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Utility Functions Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['business', 'influencer', 'admin'].map(role => (
              <div key={role} className="bg-gray-50 p-3 rounded">
                <h3 className="font-medium mb-2 capitalize">{role}</h3>
                <p className="text-sm"><strong>Dashboard:</strong> {getDashboardPath(role as any)}</p>
                <p className="text-sm"><strong>Validated:</strong> {validateUserRole(role)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex gap-4">
          <a href="/debug" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Debug Page
          </a>
          <a href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}