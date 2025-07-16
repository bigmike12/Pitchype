'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PlatformSetting {
  id?: string;
  key: string;
  value: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  created_at?: string;
  updated_at?: string;
}

interface UsePlatformSettingsReturn {
  settings: PlatformSetting[];
  isLoading: boolean;
  isSubmitting: boolean;
  fetchSettings: () => Promise<void>;
  createSetting: (data: Omit<PlatformSetting, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSetting: (id: string, data: Partial<Omit<PlatformSetting, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteSetting: (id: string) => Promise<void>;
  getSetting: (key: string) => PlatformSetting | undefined;
}

export type { PlatformSetting };

export function usePlatformSettings(): UsePlatformSettingsReturn {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/platform-settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch platform settings');
      }

      const data = await response.json();
      setSettings(data.settings || []);
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      toast.error('Failed to load platform settings');
    } finally {
      setIsLoading(false);
    }
  };

  const createSetting = async (data: Omit<PlatformSetting, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/platform-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create setting');
      }

      const result = await response.json();
      setSettings(prev => [...prev, result.setting]);
      toast.success('Setting created successfully!');
    } catch (error) {
      console.error('Error creating setting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create setting';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSetting = async (id: string, data: Partial<Omit<PlatformSetting, 'id' | 'created_at' | 'updated_at'>>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/platform-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update setting');
      }

      const result = await response.json();
      setSettings(prev => prev.map(setting => 
        setting.id === id ? result.setting : setting
      ));
      toast.success('Setting updated successfully!');
    } catch (error) {
      console.error('Error updating setting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update setting';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSetting = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/platform-settings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete setting');
      }

      setSettings(prev => prev.filter(setting => setting.id !== id));
      toast.success('Setting deleted successfully!');
    } catch (error) {
      console.error('Error deleting setting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete setting';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSetting = (key: string): PlatformSetting | undefined => {
    return settings.find(setting => setting.key === key);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSubmitting,
    fetchSettings,
    createSetting,
    updateSetting,
    deleteSetting,
    getSetting,
  };
}