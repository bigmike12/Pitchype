'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestRegistrationPage() {
  const { signUp, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'influencer' as 'influencer' | 'business',
    companyName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const { error } = await signUp(formData.email, formData.password, formData);
      
      if (error) {
        setMessage(`Registration failed: ${error.message}`);
      } else {
        setMessage('Registration successful! Redirecting...');
        // The middleware should handle the redirect automatically
      }
    } catch (err) {
      setMessage(`Unexpected error: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTestUser = () => {
    const timestamp = Date.now();
    setFormData({
      email: `test${timestamp}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      userType: Math.random() > 0.5 ? 'influencer' : 'business',
      companyName: 'Test Company'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Registration</h1>
        
        <button
          onClick={generateTestUser}
          className="w-full mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Generate Test User Data
        </button>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Type
            </label>
            <select
              value={formData.userType}
              onChange={(e) => setFormData({...formData, userType: e.target.value as 'influencer' | 'business'})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="influencer">Influencer</option>
              <option value="business">Business</option>
            </select>
          </div>
          
          {formData.userType === 'business' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Register Test User'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes('successful') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-medium text-gray-900 mb-2">Test Navigation:</h3>
          <div className="space-y-2">
            <a href="/debug" className="block text-blue-600 hover:text-blue-800">Debug Page</a>
            <a href="/test-roles" className="block text-blue-600 hover:text-blue-800">Test Roles</a>
            <a href="/auth/login" className="block text-blue-600 hover:text-blue-800">Login Page</a>
          </div>
        </div>
      </div>
    </div>
  );
}