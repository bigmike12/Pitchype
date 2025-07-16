'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Settings, Trash2, Edit, Plus, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePlatformSettings, type PlatformSetting } from '@/hooks/usePlatformSettings';

// Remove local interface - use the one from the hook

interface PlatformSettingsProps {
  className?: string;
}

export default function PlatformSettings({ className }: PlatformSettingsProps) {
  const {
    settings,
    isLoading,
    isSubmitting,
    fetchSettings,
    createSetting,
    updateSetting,
    deleteSetting,
  } = usePlatformSettings();
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    description: ''
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);



  const handleUpdateSetting = async (id: string, data: { value: string }) => {
    try {
      setSaving(id);
      setError(null);
      setSuccess(null);

      await updateSetting(id, data);
      setSuccess('Setting updated successfully!');
      // Find the setting by id to get its key for editing state
      const setting = settings.find(s => s.id === id);
      if (setting) {
        setEditingSettings(prev => {
          const updated = { ...prev };
          delete updated[setting.key];
          return updated;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  const handleCreateSetting = async () => {
    if (!newSetting.key || !newSetting.value) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving('new');
      setError(null);
      setSuccess(null);

      await createSetting({
        key: newSetting.key,
        value: newSetting.value,
        description: newSetting.description
      });
      setSuccess('Setting created successfully!');
      setNewSetting({ key: '', value: '', description: '' });
      setShowAddDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create setting');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteSetting = async (id: string) => {
    const setting = settings.find(s => s.id === id);
    if (!confirm(`Are you sure you want to delete the setting "${setting?.key}"?`)) {
      return;
    }

    try {
      setSaving(id);
      setError(null);
      setSuccess(null);

      await deleteSetting(id);
      setSuccess('Setting deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete setting');
    } finally {
      setSaving(null);
    }
  };

  const handleEditChange = (settingKey: string, value: string) => {
    setEditingSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
  };

  const startEditing = (setting: PlatformSetting) => {
    setEditingSettings(prev => ({
      ...prev,
      [setting.key]: setting.value
    }));
  };

  const cancelEditing = (settingKey: string) => {
    setEditingSettings(prev => {
      const updated = { ...prev };
      delete updated[settingKey];
      return updated;
    });
  };

  const formatSettingKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSettingDescription = (setting: PlatformSetting) => {
    if (setting.description) return setting.description;
    
    // Default descriptions for common settings
    const descriptions: Record<string, string> = {
      'platform_fee_percentage': 'Percentage fee charged on influencer payouts',
      'transaction_fee_percentage': 'Percentage fee charged on business payments',
      'transaction_fee_cap': 'Maximum transaction fee amount in NGN',
      'auto_release_days': 'Days before escrow is automatically released',
      'default_currency': 'Default currency for all transactions'
    };
    
    return descriptions[setting.key] || 'No description available';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading platform settings...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Platform Settings</h2>
          <p className="text-gray-600">Configure platform fees, auto-release settings, and other system parameters</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Platform Setting</DialogTitle>
              <DialogDescription>
                Create a new configurable platform setting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="setting-key">Setting Key</Label>
                <Input
                  id="setting-key"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="e.g., platform_fee_percentage"
                />
              </div>
              <div>
                <Label htmlFor="setting-value">Setting Value</Label>
                <Input
                  id="setting-value"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <Label htmlFor="setting-description">Description (Optional)</Label>
                <Textarea
                  id="setting-description"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this setting controls"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSetting} disabled={saving === 'new'}>
                {saving === 'new' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Setting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {settings.map((setting) => {
          const isEditing = setting.key in editingSettings;
          const currentValue = isEditing ? editingSettings[setting.key] : setting.value;
          const isSaving = saving === setting.id;

          return (
            <Card key={setting.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{formatSettingKey(setting.key)}</CardTitle>
                    <CardDescription>{getSettingDescription(setting)}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(setting)}
                          disabled={isSaving}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSetting(setting.id!)}
                          disabled={isSaving}
                          className="text-red-600 hover:text-red-700"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateSetting(setting.id!, { value: currentValue })}
                          disabled={isSaving || currentValue === setting.value}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelEditing(setting.key)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={`setting-${setting.id}`}>Value</Label>
                  {isEditing ? (
                    <Input
                      id={`setting-${setting.id}`}
                      value={currentValue}
                      onChange={(e) => handleEditChange(setting.key, e.target.value)}
                      disabled={isSaving}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded border">
                      <code className="text-sm">{setting.value}</code>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Last updated: {setting.updated_at ? new Date(setting.updated_at).toLocaleString() : 'Never'}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {settings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No platform settings found. Create your first setting to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}