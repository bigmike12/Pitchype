'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Building, CreditCard, Bell, Shield, Globe, Mail, MapPin, Save, Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface BusinessProfile {
  companyName: string;
  industry: string;
  website: string;
  description: string;
  logo: string;
  contactEmail: string;

  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  socialMedia: {
    instagram: string;
    twitter: string;
    linkedin: string;
    facebook: string;
  };
}

interface NotificationSettings {
  emailNotifications: {
    campaignUpdates: boolean;
    newApplications: boolean;
    paymentAlerts: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
  };
  pushNotifications: {
    instantMessages: boolean;
    campaignMilestones: boolean;
    urgentAlerts: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

interface BillingInfo {
  plan: 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  paymentMethod: {
    type: 'card' | 'bank';
    last4: string;
    expiryDate?: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: number;
  loginAlerts: boolean;
}

const mockProfile: BusinessProfile = {
  companyName: 'TechCorp Solutions',
  industry: 'Technology',
  website: 'https://techcorp.com',
  description: 'Leading technology solutions provider specializing in innovative software development and digital transformation.',
  logo: '',
  contactEmail: 'contact@techcorp.com',
  address: {
    street: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States'
  },
  socialMedia: {
    instagram: '@techcorp',
    twitter: '@techcorp',
    linkedin: 'company/techcorp',
    facebook: 'techcorp'
  }
};

const mockNotifications: NotificationSettings = {
  emailNotifications: {
    campaignUpdates: true,
    newApplications: true,
    paymentAlerts: true,
    systemUpdates: false,
    marketingEmails: false
  },
  pushNotifications: {
    instantMessages: true,
    campaignMilestones: true,
    urgentAlerts: true
  },
  frequency: 'immediate'
};

const mockBilling: BillingInfo = {
  plan: 'professional',
  billingCycle: 'monthly',
  nextBillingDate: '2024-02-15',
  paymentMethod: {
    type: 'card',
    last4: '4242',
    expiryDate: '12/26'
  },
  billingAddress: {
    street: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States'
  }
};

const mockSecurity: SecuritySettings = {
  twoFactorEnabled: true,
  lastPasswordChange: '2024-01-15',
  activeSessions: 3,
  loginAlerts: true
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<BusinessProfile>(mockProfile);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotifications);
  const [billing] = useState<BillingInfo>(mockBilling);
  const [security, setSecurity] = useState<SecuritySettings>(mockSecurity);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Settings form skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Profile section */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6" />
            
            {/* Form fields */}
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            
            {/* Description field */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Additional settings sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const tabs = [
    { id: 'profile', label: 'Company Profile', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and business information</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <MotionDiv
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your business details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
                    <Input
                      id="companyName"
                      value={profile.companyName}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="industry" className="text-sm font-medium">Industry</label>
                    <Select value={profile.industry} onValueChange={(value) => setProfile({ ...profile, industry: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Beauty">Beauty</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Food">Food & Beverage</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="website" className="text-sm font-medium">Website</label>
                    <Input
                      id="website"
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="text-sm font-medium">Contact Email</label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={profile.contactEmail}
                      onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="text-sm font-medium">Company Description</label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder="Describe your company and what you do..."
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="text-sm font-medium">Company Logo</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {profile.logo ? (
                        <img src={profile.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      {profile.logo && (
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Address</CardTitle>
                <CardDescription>Your company's physical address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="street" className="text-sm font-medium">Street Address</label>
                  <Input
                    id="street"
                    value={profile.address.street}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address, street: e.target.value }
                    })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="text-sm font-medium">City</label>
                    <Input
                      id="city"
                      value={profile.address.city}
                      onChange={(e) => setProfile({
                        ...profile,
                        address: { ...profile.address, city: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="text-sm font-medium">State</label>
                    <Input
                      id="state"
                      value={profile.address.state}
                      onChange={(e) => setProfile({
                        ...profile,
                        address: { ...profile.address, state: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="text-sm font-medium">ZIP Code</label>
                    <Input
                      id="zipCode"
                      value={profile.address.zipCode}
                      onChange={(e) => setProfile({
                        ...profile,
                        address: { ...profile.address, zipCode: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Connect your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="instagram" className="text-sm font-medium">Instagram</label>
                    <Input
                      id="instagram"
                      value={profile.socialMedia.instagram}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, instagram: e.target.value }
                      })}
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitter" className="text-sm font-medium">Twitter</label>
                    <Input
                      id="twitter"
                      value={profile.socialMedia.twitter}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, twitter: e.target.value }
                      })}
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</label>
                    <Input
                      id="linkedin"
                      value={profile.socialMedia.linkedin}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, linkedin: e.target.value }
                      })}
                      placeholder="company/name"
                    />
                  </div>
                  <div>
                    <label htmlFor="facebook" className="text-sm font-medium">Facebook</label>
                    <Input
                      id="facebook"
                      value={profile.socialMedia.facebook}
                      onChange={(e) => setProfile({
                        ...profile,
                        socialMedia: { ...profile.socialMedia, facebook: e.target.value }
                      })}
                      placeholder="page-name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what email notifications you'd like to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.emailNotifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {key === 'campaignUpdates' && 'Get notified about campaign status changes'}
                        {key === 'newApplications' && 'Receive alerts when influencers apply to your campaigns'}
                        {key === 'paymentAlerts' && 'Important payment and billing notifications'}
                        {key === 'systemUpdates' && 'Platform updates and maintenance notifications'}
                        {key === 'marketingEmails' && 'Tips, best practices, and promotional content'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        emailNotifications: {
                          ...notifications.emailNotifications,
                          [key]: checked
                        }
                      })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Manage your browser and mobile push notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.pushNotifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {key === 'instantMessages' && 'Real-time messages from influencers'}
                        {key === 'campaignMilestones' && 'Important campaign progress updates'}
                        {key === 'urgentAlerts' && 'Critical notifications requiring immediate attention'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        pushNotifications: {
                          ...notifications.pushNotifications,
                          [key]: checked
                        }
                      })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notification Frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Frequency</CardTitle>
                <CardDescription>How often would you like to receive digest emails?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={notifications.frequency}
                  onValueChange={(value: 'immediate' | 'daily' | 'weekly') => 
                    setNotifications({ ...notifications, frequency: value })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription and billing preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold capitalize">{billing.plan} Plan</h3>
                      <Badge className={getPlanBadgeColor(billing.plan)}>
                        {billing.plan}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Billed {billing.billingCycle} • Next payment: {new Date(billing.nextBillingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline">Cancel Subscription</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Your default payment method for subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {billing.paymentMethod.type === 'card' ? 'Credit Card' : 'Bank Account'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {billing.paymentMethod.type === 'card' 
                          ? `•••• •••• •••• ${billing.paymentMethod.last4} • Expires ${billing.paymentMethod.expiryDate}`
                          : `•••• •••• •••• ${billing.paymentMethod.last4}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Update</Button>
                    <Button variant="outline" size="sm">Remove</Button>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
                <CardDescription>Address for billing and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{billing.billingAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {billing.billingAddress.city}, {billing.billingAddress.state} {billing.billingAddress.zipCode}
                      </p>
                      <p className="text-sm text-gray-600">{billing.billingAddress.country}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">
                  Update Billing Address
                </Button>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Download your invoices and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: '2024-01-15', amount: '₦99.00', status: 'Paid', invoice: 'INV-001' },
    { date: '2023-12-15', amount: '₦99.00', status: 'Paid', invoice: 'INV-002' },
    { date: '2023-11-15', amount: '₦99.00', status: 'Paid', invoice: 'INV-003' }
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{payment.invoice}</p>
                        <p className="text-sm text-gray-600">{payment.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{payment.amount}</span>
                        <Badge className="bg-green-100 text-green-800">{payment.status}</Badge>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password */}
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button>Update Password</Button>
                <p className="text-sm text-gray-600">
                  Last changed: {new Date(security.lastPasswordChange).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">
                      {security.twoFactorEnabled 
                        ? 'Your account is protected with 2FA'
                        : 'Secure your account with 2FA'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={security.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Login Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Login Alerts</CardTitle>
                <CardDescription>Get notified of suspicious login activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email alerts for new logins</p>
                    <p className="text-sm text-gray-600">
                      Receive an email when someone logs into your account from a new device
                    </p>
                  </div>
                  <Switch
                    checked={security.loginAlerts}
                    onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active login sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-600">MacBook Pro • San Francisco, CA • Active now</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">iPhone</p>
                      <p className="text-sm text-gray-600">Mobile App • San Francisco, CA • 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">Revoke</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Chrome Browser</p>
                      <p className="text-sm text-gray-600">Windows PC • New York, NY • 1 day ago</p>
                    </div>
                    <Button variant="outline" size="sm">Revoke</Button>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">Revoke All Other Sessions</Button>
              </CardContent>
            </Card>

            {/* Account Deletion */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </MotionDiv>

      {/* Save Button */}
      {activeTab !== 'billing' && activeTab !== 'security' && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}