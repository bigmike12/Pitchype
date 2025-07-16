'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCampaigns, useCampaign } from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CampaignForm {
  title: string;
  description: string;
  category: string;
  budget_min: string;
  budget_max: string;
  minimum_followers: string;
  requiredInfluencers: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  requirements: string[];
  platforms: string[];
  deliverables: string[];
  targetAudience: string;
  guidelines: string;
  status: string;
}

const categories = [
  'Fashion & Beauty',
  'Technology',
  'Health & Fitness',
  'Food & Beverage',
  'Travel',
  'Lifestyle',
  'Gaming',
  'Education',
  'Finance',
  'Other'
];

const platforms = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter',
  'Facebook',
  'LinkedIn',
  'Snapchat',
  'Pinterest'
];

const deliverableOptions = [
  'Instagram Post',
  'Instagram Story',
  'Instagram Reel',
  'TikTok Video',
  'YouTube Video',
  'YouTube Short',
  'Twitter Post',
  'Facebook Post',
  'Blog Post',
  'Product Review'
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' }
];

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { updateCampaign } = useCampaigns();
  const {
    campaign,
    loading: isCampaignLoading,
    error: campaignError,
    refetch: fetchCampaign
  } = useCampaign(params.id as string);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  
  const [form, setForm] = useState<CampaignForm>({
    title: '',
    description: '',
    category: '',
    budget_min: '',
    budget_max: '',
    minimum_followers: '',
    requiredInfluencers: '1',
    startDate: undefined,
    endDate: undefined,
    requirements: [],
    platforms: [],
    deliverables: [],
    targetAudience: '',
    guidelines: '',
    status: 'draft'
  });

  useEffect(() => {
    if (campaign) {
      setForm({
        title: campaign.title || '',
        description: campaign.description || '',
        category: campaign.tags?.[0] || '',
        budget_min: campaign.budget_min?.toString() || '',
        budget_max: campaign.budget_max?.toString() || '',
        minimum_followers: campaign.minimum_followers?.toString() || '',
        requiredInfluencers: campaign.required_influencers?.toString() || '1',
        startDate: campaign.start_date ? new Date(campaign.start_date) : undefined,
        endDate: campaign.end_date ? new Date(campaign.end_date) : undefined,
        requirements: campaign.requirements ? campaign.requirements.split('\n').filter(Boolean) : [],
        platforms: campaign.platforms || campaign.campaign_goals || [],
        deliverables: campaign.deliverables || [],
        targetAudience: campaign.target_audience || '',
        guidelines: campaign.guidelines || '',
        status: campaign.status || 'draft'
      });
      setLoading(false);
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      if (!user?.id) {
        toast.error('You must be logged in to update a campaign');
        return;
      }

      const campaignData = {
        title: form.title,
        description: form.description,
        requirements: form.requirements.join('\n'),
        budget_min: parseFloat(form.budget_min) || undefined,
        budget_max: parseFloat(form.budget_max) || undefined,
        minimum_followers: parseInt(form.minimum_followers) || undefined,
        deliverables: form.deliverables,
        target_audience: form.targetAudience || undefined,
        platforms: form.platforms,
        guidelines: form.guidelines || undefined,
        start_date: form.startDate?.toISOString().split('T')[0] || undefined,
        end_date: form.endDate?.toISOString().split('T')[0] || undefined,
        required_influencers: parseInt(form.requiredInfluencers) || 1,
        status: form.status as 'active' | 'completed' | 'cancelled' | 'draft' | 'paused',
        tags: [form.category],
        campaign_goals: []
      };

      await updateCampaign(params.id as string, campaignData);
      toast.success('Campaign updated successfully!');
      router.push(`/business/campaigns/${params.id}`);
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setForm(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const togglePlatform = (platform: string) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const toggleDeliverable = (deliverable: string) => {
    setForm(prev => ({
      ...prev,
      deliverables: prev.deliverables.includes(deliverable)
        ? prev.deliverables.filter(d => d !== deliverable)
        : [...prev.deliverables, deliverable]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/business/campaigns/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="text-gray-600 mt-1">Update your campaign details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the essential details for your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Title *</label>
                <Input
                  placeholder="Enter campaign title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Describe your campaign objectives and what you're looking for"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Budget (NGN) *</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={form.budget_min}
                  onChange={(e) => setForm(prev => ({ ...prev, budget_min: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Budget (NGN) *</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={form.budget_max}
                  onChange={(e) => setForm(prev => ({ ...prev, budget_max: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Followers (Optional)</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={form.minimum_followers}
                  onChange={(e) => setForm(prev => ({ ...prev, minimum_followers: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Influencers *</label>
                <Input
                  type="number"
                  placeholder="1"
                  min="1"
                  value={form.requiredInfluencers}
                  onChange={(e) => setForm(prev => ({ ...prev, requiredInfluencers: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={(value) => setForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.startDate ? format(form.startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.startDate}
                      onSelect={(date) => setForm(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.endDate ? format(form.endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.endDate}
                      onSelect={(date) => setForm(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platforms & Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle>Platforms & Deliverables</CardTitle>
            <CardDescription>Update the platforms and content types for your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Target Platforms *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map(platform => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={form.platforms.includes(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                    />
                    <label htmlFor={platform} className="text-sm">{platform}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Required Deliverables *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliverableOptions.map(deliverable => (
                  <div key={deliverable} className="flex items-center space-x-2">
                    <Checkbox
                      id={deliverable}
                      checked={form.deliverables.includes(deliverable)}
                      onCheckedChange={() => toggleDeliverable(deliverable)}
                    />
                    <label htmlFor={deliverable} className="text-sm">{deliverable}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements & Guidelines</CardTitle>
            <CardDescription>Update your requirements and content guidelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Campaign Requirements</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {req}
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Textarea
                placeholder="Describe your target audience demographics and interests"
                value={form.targetAudience}
                onChange={(e) => setForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content Guidelines</label>
              <Textarea
                placeholder="Provide specific guidelines for content creation, brand voice, dos and don'ts"
                value={form.guidelines}
                onChange={(e) => setForm(prev => ({ ...prev, guidelines: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href={`/business/campaigns/${params.id}`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}