'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, MapPin, Globe, Camera, Bell, Shield, CreditCard, Palette, Eye, Lock, Trash2, Save, Plus, X, Instagram, Youtube, Video, Facebook, Twitter, Linkedin, Phone } from 'lucide-react';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  avatar: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  website: string;
  categories: string[];
  languages: string[];
  socialMedia: {
    platform: string;
    username: string;
    followers: number;
    verified: boolean;
    connected: boolean;
  }[];
  rates: {
    postRate: number;
    storyRate: number;
    videoRate: number;
    packageDeals: boolean;
  };
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    workingHours: {
      start: string;
      end: string;
    };
    timezone: string;
  };
}

interface NotificationSettings {
  email: {
    newCampaigns: boolean;
    applicationUpdates: boolean;
    paymentNotifications: boolean;
    messageNotifications: boolean;
    weeklyReports: boolean;
    marketingEmails: boolean;
  };
  push: {
    newCampaigns: boolean;
    applicationUpdates: boolean;
    paymentNotifications: boolean;
    messageNotifications: boolean;
  };
  sms: {
    paymentNotifications: boolean;
    urgentUpdates: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'business_only';
  showEarnings: boolean;
  showFollowerCount: boolean;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  dataSharing: {
    analytics: boolean;
    demographics: boolean;
    performance: boolean;
  };
}

interface PaymentSettings {
  bankAccount: {
    accountHolderName: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
  };
  paypal: {
    email: string;
    verified: boolean;
  };
  preferredMethod: 'bank' | 'paypal';
  minimumPayout: number;
  taxInformation: {
    taxId: string;
    w9Submitted: boolean;
  };
}

const mockProfile: UserProfile = {
  id: '1',
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@email.com',
  bio: 'Fashion and lifestyle influencer passionate about sustainable living and authentic storytelling. I love creating content that inspires and connects with my audience.',
  avatar: '',
  location: {
    city: 'Los Angeles',
    state: 'California',
    country: 'United States'
  },
  website: 'https://alexjohnson.com',
  categories: ['Fashion', 'Lifestyle', 'Beauty', 'Travel'],
  languages: ['English', 'Spanish'],
  socialMedia: [
    {
      platform: 'Instagram',
      username: '@alexjohnson',
      followers: 125000,
      verified: true,
      connected: true
    },
    {
      platform: 'TikTok',
      username: '@alexjohnson',
      followers: 89000,
      verified: false,
      connected: true
    },
    {
      platform: 'YouTube',
      username: 'Alex Johnson',
      followers: 45000,
      verified: true,
      connected: true
    },
    {
      platform: 'Twitter',
      username: '@alexjohnson',
      followers: 32000,
      verified: false,
      connected: false
    }
  ],
  rates: {
    postRate: 500,
    storyRate: 200,
    videoRate: 1200,
    packageDeals: true
  },
  availability: {
    status: 'available',
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    timezone: 'PST'
  }
};

const mockNotifications: NotificationSettings = {
  email: {
    newCampaigns: true,
    applicationUpdates: true,
    paymentNotifications: true,
    messageNotifications: true,
    weeklyReports: true,
    marketingEmails: false
  },
  push: {
    newCampaigns: true,
    applicationUpdates: true,
    paymentNotifications: true,
    messageNotifications: false
  },
  sms: {
    paymentNotifications: true,
    urgentUpdates: true
  }
};

const mockPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  showEarnings: false,
  showFollowerCount: true,
  allowDirectMessages: true,
  showOnlineStatus: true,
  dataSharing: {
    analytics: true,
    demographics: false,
    performance: true
  }
};

const mockPayment: PaymentSettings = {
  bankAccount: {
    accountHolderName: '',
    bankName: '',
    bankCode: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking'
  },
  paypal: {
    email: '',
    verified: false
  },
  preferredMethod: 'bank',
  minimumPayout: 50,
  taxInformation: {
    taxId: '',
    w9Submitted: false
  }
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotifications);
  const [privacy, setPrivacy] = useState<PrivacySettings>(mockPrivacy);
  const [payment, setPayment] = useState<PaymentSettings>(mockPayment);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [banks, setBanks] = useState<Array<{name: string, code: string}>>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

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
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            
            {/* Bio field */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            
            {/* Social media section */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
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

  const categories = [
    'Fashion', 'Beauty', 'Lifestyle', 'Travel', 'Food', 'Fitness', 'Technology',
    'Gaming', 'Music', 'Art', 'Photography', 'Business', 'Education', 'Health'
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
  ];

  const timezones = [
    'PST', 'MST', 'CST', 'EST', 'GMT', 'CET', 'JST', 'AEST'
  ];

  const availabilityStatuses = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
    { value: 'busy', label: 'Busy', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'unavailable', label: 'Unavailable', color: 'bg-red-100 text-red-800' }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show success message
  };

  const fetchBanks = useCallback(async () => {
    setLoadingBanks(true);
    try {
      const response = await fetch('https://api.paystack.co/bank');
      const data = await response.json();
      if (data.status) {
        setBanks(data.data);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    } finally {
      setLoadingBanks(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleAddCategory = () => {
    if (newCategory && !profile.categories.includes(newCategory)) {
      setProfile({
        ...profile,
        categories: [...profile.categories, newCategory]
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setProfile({
      ...profile,
      categories: profile.categories.filter(c => c !== category)
    });
  };

  const handleAddLanguage = () => {
    if (newLanguage && !profile.languages.includes(newLanguage)) {
      setProfile({
        ...profile,
        languages: [...profile.languages, newLanguage]
      });
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter(l => l !== language)
    });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': return <Video className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and profile information</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="bg-green-500 hover:bg-green-600">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
           <TabsTrigger value="profile" className="flex items-center gap-2">
             <User className="w-4 h-4" />
             Profile
           </TabsTrigger>
           <TabsTrigger value="social" className="flex items-center gap-2">
             <Globe className="w-4 h-4" />
             Social Media
           </TabsTrigger>
           <TabsTrigger value="rates" className="flex items-center gap-2">
             <CreditCard className="w-4 h-4" />
             Rates & Availability
           </TabsTrigger>
           <TabsTrigger value="payment" className="flex items-center gap-2">
             <CreditCard className="w-4 h-4" />
             Payment
           </TabsTrigger>
           <TabsTrigger value="notifications" className="flex items-center gap-2">
             <Bell className="w-4 h-4" />
             Notifications
           </TabsTrigger>
           <TabsTrigger value="privacy" className="flex items-center gap-2">
             <Shield className="w-4 h-4" />
             Privacy & Security
           </TabsTrigger>
          </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="border-t my-4" />

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>

                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                  />
                  <p className="text-sm text-gray-600 mt-1">{profile.bio.length}/500 characters</p>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <Input
                      placeholder="City"
                      value={profile.location.city}
                      onChange={(e) => setProfile({
                        ...profile,
                        location: { ...profile.location, city: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="State/Province"
                      value={profile.location.state}
                      onChange={(e) => setProfile({
                        ...profile,
                        location: { ...profile.location, state: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="Country"
                      value={profile.location.country}
                      onChange={(e) => setProfile({
                        ...profile,
                        location: { ...profile.location, country: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="text-sm font-medium">Content Categories</label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {profile.categories.map(category => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1">
                        {category}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleRemoveCategory(category)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => !profile.categories.includes(cat)).map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddCategory} disabled={!newCategory}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="text-sm font-medium">Languages</label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {profile.languages.map(language => (
                      <Badge key={language} variant="secondary" className="flex items-center gap-1">
                        {language}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleRemoveLanguage(language)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newLanguage} onValueChange={setNewLanguage}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.filter(lang => !profile.languages.includes(lang)).map(language => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddLanguage} disabled={!newLanguage}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Social Media Accounts</CardTitle>
                <CardDescription>Connect and manage your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.socialMedia.map((social, index) => (
                  <MotionDiv
                    key={social.platform}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getSocialIcon(social.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{social.platform}</h3>
                          {social.verified && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {social.username} • {formatNumber(social.followers)} followers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={social.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {social.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {social.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </MotionDiv>
                ))}
                
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Social Media Account
                </Button>
              </CardContent>
            </Card>
          </MotionDiv>
        </TabsContent>

        {/* Rates & Availability Tab */}
        <TabsContent value="rates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Content Rates</CardTitle>
                  <CardDescription>Set your pricing for different types of content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="postRate" className="text-sm font-medium">Instagram Post Rate (₦)</label>
                    <Input
                      id="postRate"
                      type="number"
                      value={profile.rates.postRate}
                      onChange={(e) => setProfile({
                        ...profile,
                        rates: { ...profile.rates, postRate: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label htmlFor="storyRate" className="text-sm font-medium">Story Rate (₦)</label>
                    <Input
                      id="storyRate"
                      type="number"
                      value={profile.rates.storyRate}
                      onChange={(e) => setProfile({
                        ...profile,
                        rates: { ...profile.rates, storyRate: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label htmlFor="videoRate" className="text-sm font-medium">Video Content Rate (₦)</label>
                    <Input
                      id="videoRate"
                      type="number"
                      value={profile.rates.videoRate}
                      onChange={(e) => setProfile({
                        ...profile,
                        rates: { ...profile.rates, videoRate: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="packageDeals"
                      checked={profile.rates.packageDeals}
                      onCheckedChange={(checked) => setProfile({
                        ...profile,
                        rates: { ...profile.rates, packageDeals: checked }
                      })}
                    />
                    <label htmlFor="packageDeals" className="text-sm font-medium">Offer package deals</label>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>Manage your availability status and working hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Current Status</label>
                    <Select
                      value={profile.availability.status}
                      onValueChange={(value: 'available' | 'busy' | 'unavailable') => setProfile({
                        ...profile,
                        availability: { ...profile.availability, status: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityStatuses.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Working Hours</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label htmlFor="startTime" className="text-sm font-medium">Start Time</label>
                        <Input
                          id="startTime"
                          type="time"
                          value={profile.availability.workingHours.start}
                          onChange={(e) => setProfile({
                            ...profile,
                            availability: {
                              ...profile.availability,
                              workingHours: {
                                ...profile.availability.workingHours,
                                start: e.target.value
                              }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label htmlFor="endTime" className="text-sm font-medium">End Time</label>
                        <Input
                          id="endTime"
                          type="time"
                          value={profile.availability.workingHours.end}
                          onChange={(e) => setProfile({
                            ...profile,
                            availability: {
                              ...profile.availability,
                              workingHours: {
                                ...profile.availability.workingHours,
                                end: e.target.value
                              }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <Select
                      value={profile.availability.timezone}
                      onValueChange={(value) => setProfile({
                        ...profile,
                        availability: { ...profile.availability, timezone: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(timezone => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          </div>
        </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment & Payout Settings</CardTitle>
                <CardDescription>
                  Manage your payment methods and payout preferences for campaign earnings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preferred Payment Method */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Preferred Payment Method</label>
                  <Select value={payment.preferredMethod} onValueChange={(value: 'bank' | 'paypal') => setPayment({...payment, preferredMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bank Account Information */}
                {payment.preferredMethod === 'bank' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">Bank Account Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Account Holder Name</label>
                        <Input
                          value={payment.bankAccount.accountHolderName}
                          onChange={(e) => setPayment({
                            ...payment,
                            bankAccount: { ...payment.bankAccount, accountHolderName: e.target.value }
                          })}
                          placeholder="Full name on account"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bank Name</label>
                        <Select 
                          value={payment.bankAccount.bankCode} 
                          onValueChange={(value) => {
                            const selectedBank = banks.find(bank => bank.code === value);
                            setPayment({
                              ...payment,
                              bankAccount: { 
                                ...payment.bankAccount, 
                                bankCode: value,
                                bankName: selectedBank?.name || ''
                              }
                            });
                          }}
                          disabled={loadingBanks}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingBanks ? "Loading banks..." : "Select a bank"} />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.filter(bank => bank && bank.name && bank.code).map((bank, index) => (
                              <SelectItem key={`${bank.code}-${index}`} value={bank.code}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Account Number</label>
                        <Input
                          type="text"
                          value={payment.bankAccount.accountNumber}
                          onChange={(e) => setPayment({
                            ...payment,
                            bankAccount: { ...payment.bankAccount, accountNumber: e.target.value }
                          })}
                          placeholder="Account number"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Routing Number</label>
                        <Input
                          value={payment.bankAccount.routingNumber}
                          onChange={(e) => setPayment({
                            ...payment,
                            bankAccount: { ...payment.bankAccount, routingNumber: e.target.value }
                          })}
                          placeholder="9-digit routing number"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Account Type</label>
                        <Select value={payment.bankAccount.accountType} onValueChange={(value: 'checking' | 'savings') => setPayment({
                          ...payment,
                          bankAccount: { ...payment.bankAccount, accountType: value }
                        })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Information */}
                {payment.preferredMethod === 'paypal' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">PayPal Account</h4>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">PayPal Email</label>
                      <Input
                        type="email"
                        value={payment.paypal.email}
                        onChange={(e) => setPayment({
                          ...payment,
                          paypal: { ...payment.paypal, email: e.target.value }
                        })}
                        placeholder="your-paypal@email.com"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        payment.paypal.verified ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm">
                        {payment.paypal.verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Minimum Payout */}
                {/* <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Payout Amount</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">₦</span>
                    <Input
                      type="number"
                      value={payment.minimumPayout}
                      onChange={(e) => setPayment({...payment, minimumPayout: parseInt(e.target.value) || 0})}
                      min="25"
                      max="1000"
                      className="w-32"
                    />
                    <span className="text-sm text-gray-600">(minimum ₦25)</span>
                  </div>
                </div> */}

                {/* Tax Information */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Tax Information</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tax ID / SSN</label>
                    <Input
                      type="password"
                      value={payment.taxInformation.taxId}
                      onChange={(e) => setPayment({
                        ...payment,
                        taxInformation: { ...payment.taxInformation, taxId: e.target.value }
                      })}
                      placeholder="XXX-XX-XXXX"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      payment.taxInformation.w9Submitted ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm">
                      W-9 Form {payment.taxInformation.w9Submitted ? 'Submitted' : 'Required'}
                    </span>
                    {!payment.taxInformation.w9Submitted && (
                      <Button variant="outline" size="sm">
                        Upload W-9
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => {
                    setIsLoading(true);
                    // TODO: Save payment settings
                    setTimeout(() => setIsLoading(false), 1000);
                  }} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Payment Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about important updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label htmlFor={`email-${key}`} className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <Switch
                          id={`email-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => setNotifications({
                            ...notifications,
                            email: { ...notifications.email, [key]: checked }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t my-4" />

                {/* Push Notifications */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Push Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(notifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label htmlFor={`push-${key}`} className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <Switch
                          id={`push-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => setNotifications({
                            ...notifications,
                            push: { ...notifications.push, [key]: checked }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t my-4" />

                {/* SMS Notifications */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    SMS Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(notifications.sms).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label htmlFor={`sms-${key}`} className="text-sm font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <Switch
                          id={`sms-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => setNotifications({
                            ...notifications,
                            sms: { ...notifications.sms, [key]: checked }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </TabsContent>

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control who can see your information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Profile Visibility</label>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value: 'public' | 'private' | 'business_only') => setPrivacy({
                        ...privacy,
                        profileVisibility: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="business_only">Business Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="showEarnings" className="text-sm font-medium">Show earnings publicly</label>
                      <Switch
                        id="showEarnings"
                        checked={privacy.showEarnings}
                        onCheckedChange={(checked) => setPrivacy({
                          ...privacy,
                          showEarnings: checked
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="showFollowerCount" className="text-sm font-medium">Show follower count</label>
                      <Switch
                        id="showFollowerCount"
                        checked={privacy.showFollowerCount}
                        onCheckedChange={(checked) => setPrivacy({
                          ...privacy,
                          showFollowerCount: checked
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="allowDirectMessages" className="text-sm font-medium">Allow direct messages</label>
                      <Switch
                        id="allowDirectMessages"
                        checked={privacy.allowDirectMessages}
                        onCheckedChange={(checked) => setPrivacy({
                          ...privacy,
                          allowDirectMessages: checked
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="showOnlineStatus" className="text-sm font-medium">Show online status</label>
                      <Switch
                        id="showOnlineStatus"
                        checked={privacy.showOnlineStatus}
                        onCheckedChange={(checked) => setPrivacy({
                          ...privacy,
                          showOnlineStatus: checked
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    View Login Activity
                  </Button>
                  
                  <div className="border-t my-4" />
                  
                  <div>
                    <h4 className="font-medium mb-3">Data Sharing</h4>
                    <div className="space-y-3">
                      {Object.entries(privacy.dataSharing).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <label htmlFor={`data-${key}`} className="text-sm font-medium">
                            Share {key} data
                          </label>
                          <Switch
                            id={`data-${key}`}
                            checked={value}
                            onCheckedChange={(checked) => setPrivacy({
                              ...privacy,
                              dataSharing: { ...privacy.dataSharing, [key]: checked }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t my-4" />
                  
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </MotionDiv>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}