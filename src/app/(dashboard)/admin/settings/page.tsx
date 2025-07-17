'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Bell, DollarSign, Mail, Globe, Database, Key, Users, Building2, Star, AlertTriangle, CheckCircle, Save, RefreshCw, Upload, Download, Trash2, Plus, Edit, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface PlatformSettings {
  general: {
    platformName: string;
    platformDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
    defaultLanguage: string;
    defaultTimezone: string;
    maxFileUploadSize: number;
    allowedFileTypes: string[];
  };
  fees: {
    platformCommission: number;
    paymentProcessingFee: number;
    withdrawalFee: number;
    minimumWithdrawal: number;
    maximumWithdrawal: number;
    currencyCode: string;
    taxRate: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    systemAlerts: boolean;
    campaignUpdates: boolean;
    paymentNotifications: boolean;
    securityAlerts: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    ipWhitelist: string[];
    apiRateLimit: number;
    encryptionEnabled: boolean;
  };
  integrations: {
    paymentGateways: {
      stripe: { enabled: boolean; publicKey: string; secretKey: string };
      paystack: { enabled: boolean; publicKey: string; secretKey: string };
      paypal: { enabled: boolean; clientId: string; clientSecret: string };
    };
    socialMedia: {
      instagram: { enabled: boolean; clientId: string; clientSecret: string };
      youtube: { enabled: boolean; clientId: string; clientSecret: string };
      tiktok: { enabled: boolean; clientId: string; clientSecret: string };
      twitter: { enabled: boolean; clientId: string; clientSecret: string };
    };
    analytics: {
      googleAnalytics: { enabled: boolean; trackingId: string };
      mixpanel: { enabled: boolean; projectToken: string };
      hotjar: { enabled: boolean; siteId: string };
    };
    email: {
      sendgrid: { enabled: boolean; apiKey: string };
      mailgun: { enabled: boolean; apiKey: string; domain: string };
    };
  };
  moderation: {
    autoModerationEnabled: boolean;
    contentFilteringEnabled: boolean;
    profanityFilterEnabled: boolean;
    spamDetectionEnabled: boolean;
    manualReviewRequired: boolean;
    flaggedContentThreshold: number;
    suspensionThreshold: number;
    banThreshold: number;
  };
}

const mockSettings: PlatformSettings = {
  general: {
    platformName: 'Pitchype',
    platformDescription: 'The premier influencer marketing platform connecting brands with creators',
    supportEmail: 'support@pitchype.com',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    defaultLanguage: 'en',
    defaultTimezone: 'UTC',
    maxFileUploadSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf']
  },
  fees: {
    platformCommission: 10,
    paymentProcessingFee: 2.9,
    withdrawalFee: 1.5,
    minimumWithdrawal: 50,
    maximumWithdrawal: 10000,
    currencyCode: 'NGN',
    taxRate: 0
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: true,
    systemAlerts: true,
    campaignUpdates: true,
    paymentNotifications: true,
    securityAlerts: true
  },
  security: {
    twoFactorRequired: false,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    apiRateLimit: 1000,
    encryptionEnabled: true
  },
  integrations: {
    paymentGateways: {
      stripe: { enabled: true, publicKey: 'pk_test_***', secretKey: 'sk_test_***' },
      paystack: { enabled: true, publicKey: 'pk_test_***', secretKey: 'sk_test_***' },
      paypal: { enabled: false, clientId: '', clientSecret: '' }
    },
    socialMedia: {
      instagram: { enabled: true, clientId: '***', clientSecret: '***' },
      youtube: { enabled: true, clientId: '***', clientSecret: '***' },
      tiktok: { enabled: false, clientId: '', clientSecret: '' },
      twitter: { enabled: true, clientId: '***', clientSecret: '***' }
    },
    analytics: {
      googleAnalytics: { enabled: true, trackingId: 'GA-***' },
      mixpanel: { enabled: false, projectToken: '' },
      hotjar: { enabled: true, siteId: '***' }
    },
    email: {
      sendgrid: { enabled: true, apiKey: 'SG.***' },
      mailgun: { enabled: false, apiKey: '', domain: '' }
    }
  },
  moderation: {
    autoModerationEnabled: true,
    contentFilteringEnabled: true,
    profanityFilterEnabled: true,
    spamDetectionEnabled: true,
    manualReviewRequired: false,
    flaggedContentThreshold: 3,
    suspensionThreshold: 5,
    banThreshold: 10
  }
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(mockSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (section: keyof PlatformSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedSetting = (section: keyof PlatformSettings, subsection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to your backend
    setHasChanges(false);
  };

  const maskSecret = (secret: string) => {
    if (!secret) return '';
    return secret.length > 8 ? secret.substring(0, 4) + '***' + secret.substring(secret.length - 4) : '***';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure and manage platform settings</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button onClick={handleSaveSettings} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="fees">Fees & Pricing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Platform Configuration
                </CardTitle>
                <CardDescription>Basic platform settings and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="platformName" className="text-sm font-medium">Platform Name</label>
                    <Input
                      id="platformName"
                      value={settings.general.platformName}
                      onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="supportEmail" className="text-sm font-medium">Support Email</label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="platformDescription" className="text-sm font-medium">Platform Description</label>
                  <Textarea
                    id="platformDescription"
                    value={settings.general.platformDescription}
                    onChange={(e) => updateSetting('general', 'platformDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="defaultLanguage" className="text-sm font-medium">Default Language</label>
                    <Select value={settings.general.defaultLanguage} onValueChange={(value) => updateSetting('general', 'defaultLanguage', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="defaultTimezone" className="text-sm font-medium">Default Timezone</label>
                    <Select value={settings.general.defaultTimezone} onValueChange={(value) => updateSetting('general', 'defaultTimezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Platform Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Maintenance Mode</label>
                        <p className="text-sm text-gray-600">Temporarily disable platform access</p>
                      </div>
                      <Switch
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">User Registration</label>
                        <p className="text-sm text-gray-600">Allow new user registrations</p>
                      </div>
                      <Switch
                        checked={settings.general.registrationEnabled}
                        onCheckedChange={(checked) => updateSetting('general', 'registrationEnabled', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Email Verification Required</label>
                        <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                      </div>
                      <Switch
                        checked={settings.general.emailVerificationRequired}
                        onCheckedChange={(checked) => updateSetting('general', 'emailVerificationRequired', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">File Upload Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="maxFileSize" className="text-sm font-medium">Max File Size (MB)</label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={settings.general.maxFileUploadSize}
                        onChange={(e) => updateSetting('general', 'maxFileUploadSize', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Allowed File Types</label>
                      <div className="flex flex-wrap gap-2">
                        {settings.general.allowedFileTypes.map((type, index) => (
                          <Badge key={index} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees & Pricing */}
          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Fees & Pricing Configuration
                </CardTitle>
                <CardDescription>Configure platform fees and pricing structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="platformCommission" className="text-sm font-medium">Platform Commission (%)</label>
                    <Input
                      id="platformCommission"
                      type="number"
                      step="0.1"
                      value={settings.fees.platformCommission}
                      onChange={(e) => updateSetting('fees', 'platformCommission', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="paymentProcessingFee" className="text-sm font-medium">Payment Processing Fee (%)</label>
                    <Input
                      id="paymentProcessingFee"
                      type="number"
                      step="0.1"
                      value={settings.fees.paymentProcessingFee}
                      onChange={(e) => updateSetting('fees', 'paymentProcessingFee', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="withdrawalFee" className="text-sm font-medium">Withdrawal Fee (%)</label>
                    <Input
                      id="withdrawalFee"
                      type="number"
                      step="0.1"
                      value={settings.fees.withdrawalFee}
                      onChange={(e) => updateSetting('fees', 'withdrawalFee', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="taxRate" className="text-sm font-medium">Tax Rate (%)</label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.1"
                      value={settings.fees.taxRate}
                      onChange={(e) => updateSetting('fees', 'taxRate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="border-t my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Withdrawal Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="minWithdrawal" className="text-sm font-medium">Minimum Withdrawal</label>
                      <Input
                        id="minWithdrawal"
                        type="number"
                        value={settings.fees.minimumWithdrawal}
                        onChange={(e) => updateSetting('fees', 'minimumWithdrawal', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="maxWithdrawal" className="text-sm font-medium">Maximum Withdrawal</label>
                      <Input
                        id="maxWithdrawal"
                        type="number"
                        value={settings.fees.maximumWithdrawal}
                        onChange={(e) => updateSetting('fees', 'maximumWithdrawal', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="currencyCode" className="text-sm font-medium">Currency</label>
                      <Select value={settings.fees.currencyCode} onValueChange={(value) => updateSetting('fees', 'currencyCode', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure platform notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Email Notifications</label>
                      <p className="text-sm text-gray-600">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">SMS Notifications</label>
                      <p className="text-sm text-gray-600">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Push Notifications</label>
                      <p className="text-sm text-gray-600">Send browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Marketing Emails</label>
                      <p className="text-sm text-gray-600">Send promotional and marketing emails</p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketingEmails}
                      onCheckedChange={(checked) => updateSetting('notifications', 'marketingEmails', checked)}
                    />
                  </div>
                </div>

                <div className="border-t my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">System Alerts</label>
                        <p className="text-sm text-gray-600">Critical system notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.systemAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Campaign Updates</label>
                        <p className="text-sm text-gray-600">Campaign status and update notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.campaignUpdates}
                        onCheckedChange={(checked) => updateSetting('notifications', 'campaignUpdates', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Payment Notifications</label>
                        <p className="text-sm text-gray-600">Payment and transaction notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.paymentNotifications}
                        onCheckedChange={(checked) => updateSetting('notifications', 'paymentNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Security Alerts</label>
                        <p className="text-sm text-gray-600">Security-related notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.securityAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', 'securityAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>Configure platform security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Two-Factor Authentication Required</label>
                      <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorRequired}
                      onCheckedChange={(checked) => updateSetting('security', 'twoFactorRequired', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Data Encryption</label>
                      <p className="text-sm text-gray-600">Enable data encryption at rest</p>
                    </div>
                    <Switch
                      checked={settings.security.encryptionEnabled}
                      onCheckedChange={(checked) => updateSetting('security', 'encryptionEnabled', checked)}
                    />
                  </div>
                </div>

                <div className="border-t my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Password Policy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="passwordMinLength" className="text-sm font-medium">Minimum Password Length</label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Require Special Characters</label>
                        <p className="text-sm text-gray-600">Passwords must contain special characters</p>
                      </div>
                      <Switch
                        checked={settings.security.passwordRequireSpecialChars}
                        onCheckedChange={(checked) => updateSetting('security', 'passwordRequireSpecialChars', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Session & Access Control</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="sessionTimeout" className="text-sm font-medium">Session Timeout (hours)</label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="maxLoginAttempts" className="text-sm font-medium">Max Login Attempts</label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="apiRateLimit" className="text-sm font-medium">API Rate Limit (per hour)</label>
                      <Input
                        id="apiRateLimit"
                        type="number"
                        value={settings.security.apiRateLimit}
                        onChange={(e) => updateSetting('security', 'apiRateLimit', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Gateways */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment Gateways
                  </CardTitle>
                  <CardDescription>Configure payment processing services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.integrations.paymentGateways).map(([gateway, config]) => (
                    <div key={gateway} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{gateway}</h4>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => updateNestedSetting('integrations', 'paymentGateways', gateway, { ...config, enabled: checked })}
                        />
                      </div>
                      {config.enabled && (
                        <div className="space-y-2">
                          {('publicKey' in config) && (
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Public Key</label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type={showSecrets[`${gateway}_public`] ? 'text' : 'password'}
                                  value={showSecrets[`${gateway}_public`] ? config.publicKey : maskSecret(config.publicKey)}
                                  onChange={(e) => updateNestedSetting('integrations', 'paymentGateways', gateway, { ...config, publicKey: e.target.value })}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSecretVisibility(`${gateway}_public`)}
                                >
                                  {showSecrets[`${gateway}_public`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          )}
                          {('secretKey' in config) && (
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Secret Key</label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type={showSecrets[`${gateway}_secret`] ? 'text' : 'password'}
                                  value={showSecrets[`${gateway}_secret`] ? config.secretKey : maskSecret(config.secretKey)}
                                  onChange={(e) => updateNestedSetting('integrations', 'paymentGateways', gateway, { ...config, secretKey: e.target.value })}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSecretVisibility(`${gateway}_secret`)}
                                >
                                  {showSecrets[`${gateway}_secret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          )}
                          {('clientId' in config) && (
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Client ID</label>
                              <Input
                                value={config.clientId}
                                onChange={(e) => updateNestedSetting('integrations', 'paymentGateways', gateway, { ...config, clientId: e.target.value })}
                              />
                            </div>
                          )}
                          {('clientSecret' in config) && (
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Client Secret</label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type={showSecrets[`${gateway}_client_secret`] ? 'text' : 'password'}
                                  value={showSecrets[`${gateway}_client_secret`] ? config.clientSecret : maskSecret(config.clientSecret)}
                                  onChange={(e) => updateNestedSetting('integrations', 'paymentGateways', gateway, { ...config, clientSecret: e.target.value })}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSecretVisibility(`${gateway}_client_secret`)}
                                >
                                  {showSecrets[`${gateway}_client_secret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Social Media Platforms
                  </CardTitle>
                  <CardDescription>Configure social media integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.integrations.socialMedia).map(([platform, config]) => (
                    <div key={platform} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{platform}</h4>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => updateNestedSetting('integrations', 'socialMedia', platform, { ...config, enabled: checked })}
                        />
                      </div>
                      {config.enabled && (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Client ID</label>
                            <Input
                              value={config.clientId}
                              onChange={(e) => updateNestedSetting('integrations', 'socialMedia', platform, { ...config, clientId: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Client Secret</label>
                            <div className="flex items-center gap-2">
                              <Input
                                type={showSecrets[`${platform}_secret`] ? 'text' : 'password'}
                                value={showSecrets[`${platform}_secret`] ? config.clientSecret : maskSecret(config.clientSecret)}
                                onChange={(e) => updateNestedSetting('integrations', 'socialMedia', platform, { ...config, clientSecret: e.target.value })}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSecretVisibility(`${platform}_secret`)}
                              >
                                {showSecrets[`${platform}_secret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics Services
                  </CardTitle>
                  <CardDescription>Configure analytics and tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.integrations.analytics).map(([service, config]) => (
                    <div key={service} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => updateNestedSetting('integrations', 'analytics', service, { ...config, enabled: checked })}
                        />
                      </div>
                      {config.enabled && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium">{service === 'googleAnalytics' ? 'Tracking ID' : service === 'mixpanel' ? 'Project Token' : 'Site ID'}</label>
                          <Input
                            value={
                              service === 'googleAnalytics' && 'trackingId' in config ? config.trackingId :
                              service === 'mixpanel' && 'projectToken' in config ? config.projectToken :
                              'siteId' in config ? config.siteId : ''
                            }
                            onChange={(e) => {
                              const key = service === 'googleAnalytics' ? 'trackingId' : service === 'mixpanel' ? 'projectToken' : 'siteId';
                              updateNestedSetting('integrations', 'analytics', service, { ...config, [key]: e.target.value });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Email Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Services
                  </CardTitle>
                  <CardDescription>Configure email delivery services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.integrations.email).map(([service, config]) => (
                    <div key={service} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">{service}</h4>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={(checked) => updateNestedSetting('integrations', 'email', service, { ...config, enabled: checked })}
                        />
                      </div>
                      {config.enabled && (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">API Key</label>
                            <div className="flex items-center gap-2">
                              <Input
                                type={showSecrets[`${service}_api`] ? 'text' : 'password'}
                                value={showSecrets[`${service}_api`] ? config.apiKey : maskSecret(config.apiKey)}
                                onChange={(e) => updateNestedSetting('integrations', 'email', service, { ...config, apiKey: e.target.value })}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSecretVisibility(`${service}_api`)}
                              >
                                {showSecrets[`${service}_api`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          {service === 'mailgun' && 'domain' in config && (
                            <div className="space-y-1">
                              <label className="text-sm font-medium">Domain</label>
                              <Input
                                value={config.domain || ''}
                                onChange={(e) => updateNestedSetting('integrations', 'email', service, { ...config, domain: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moderation */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Content Moderation
                </CardTitle>
                <CardDescription>Configure content moderation and safety settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Auto Moderation</label>
                      <p className="text-sm text-gray-600">Enable automatic content moderation</p>
                    </div>
                    <Switch
                      checked={settings.moderation.autoModerationEnabled}
                      onCheckedChange={(checked) => updateSetting('moderation', 'autoModerationEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Content Filtering</label>
                      <p className="text-sm text-gray-600">Filter inappropriate content</p>
                    </div>
                    <Switch
                      checked={settings.moderation.contentFilteringEnabled}
                      onCheckedChange={(checked) => updateSetting('moderation', 'contentFilteringEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Profanity Filter</label>
                      <p className="text-sm text-gray-600">Block profanity and offensive language</p>
                    </div>
                    <Switch
                      checked={settings.moderation.profanityFilterEnabled}
                      onCheckedChange={(checked) => updateSetting('moderation', 'profanityFilterEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Spam Detection</label>
                      <p className="text-sm text-gray-600">Detect and prevent spam content</p>
                    </div>
                    <Switch
                      checked={settings.moderation.spamDetectionEnabled}
                      onCheckedChange={(checked) => updateSetting('moderation', 'spamDetectionEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Manual Review Required</label>
                      <p className="text-sm text-gray-600">Require manual review for flagged content</p>
                    </div>
                    <Switch
                      checked={settings.moderation.manualReviewRequired}
                      onCheckedChange={(checked) => updateSetting('moderation', 'manualReviewRequired', checked)}
                    />
                  </div>
                </div>

                <div className="border-t my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Moderation Thresholds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="flaggedThreshold" className="text-sm font-medium">Flagged Content Threshold</label>
                      <Input
                        id="flaggedThreshold"
                        type="number"
                        value={settings.moderation.flaggedContentThreshold}
                        onChange={(e) => updateSetting('moderation', 'flaggedContentThreshold', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-600">Number of flags before content is hidden</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="suspensionThreshold" className="text-sm font-medium">Suspension Threshold</label>
                      <Input
                        id="suspensionThreshold"
                        type="number"
                        value={settings.moderation.suspensionThreshold}
                        onChange={(e) => updateSetting('moderation', 'suspensionThreshold', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-600">Number of violations before suspension</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="banThreshold" className="text-sm font-medium">Ban Threshold</label>
                      <Input
                        id="banThreshold"
                        type="number"
                        value={settings.moderation.banThreshold}
                        onChange={(e) => updateSetting('moderation', 'banThreshold', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-600">Number of violations before permanent ban</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </MotionDiv>
    </div>
  );
}