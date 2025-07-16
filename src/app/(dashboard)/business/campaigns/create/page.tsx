'use client';

import { useState } from 'react';
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
import { ArrowLeft, Calendar as CalendarIcon, Upload, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
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
  applicationDeadline: Date | undefined;
  requirements: string[];
  platforms: string[];
  deliverables: string[];
  targetAudience: string;
  guidelines: string;
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

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createCampaign } = useCampaigns();
  const [isLoading, setIsLoading] = useState(false);
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
    applicationDeadline: undefined,
    requirements: [],
    platforms: [],
    deliverables: [],
    targetAudience: '',
    guidelines: ''
  });

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'active' = 'active') => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a campaign');
        return;
      }

      const campaignData = {
        business_id: user.id,
        title: form.title,
        description: form.description,
        requirements: form.requirements.join('\n'),
        budget_min: parseFloat(form.budget_min) || null,
        budget_max: parseFloat(form.budget_max) || null,
        minimum_followers: parseInt(form.minimum_followers) || null,
        view_count: 0,
        deliverables: form.deliverables,
        target_audience: form.targetAudience || null,
        platforms: form.platforms,
        guidelines: form.guidelines || null,
        start_date: form.startDate?.toISOString().split('T')[0] || null,
        end_date: form.endDate?.toISOString().split('T')[0] || null,
        application_deadline: form.applicationDeadline?.toISOString().split('T')[0] || null,
        required_influencers: parseInt(form.requiredInfluencers) || 1,
        status: status,
        tags: [form.category],
        campaign_goals: []
      };

      await createCampaign(campaignData);
      const message = status === 'draft' ? 'Campaign saved as draft!' : 'Campaign created and published successfully!';
      toast.success(message);
      router.push('/business/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    handleSubmit(e, 'draft');
  };

  const handlePublish = (e: React.FormEvent) => {
    handleSubmit(e, 'active');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/business/campaigns">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-gray-600 mt-1">Set up a new influencer marketing campaign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide the essential details for your campaign</CardDescription>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Followers (Optional)</label>
              <Input
                type="number"
                placeholder="10000"
                value={form.minimum_followers}
                onChange={(e) => setForm(prev => ({ ...prev, minimum_followers: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Leave empty if no minimum follower requirement</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Application Deadline *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.applicationDeadline ? format(form.applicationDeadline, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.applicationDeadline}
                      onSelect={(date) => setForm(prev => ({ ...prev, applicationDeadline: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">Last date for influencers to apply</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platforms & Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle>Platforms & Deliverables</CardTitle>
            <CardDescription>Select the platforms and content types for your campaign</CardDescription>
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
            <CardDescription>Specify your requirements and content guidelines</CardDescription>
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
          <Link href="/business/campaigns">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button 
            type="button" 
            onClick={handleSaveDraft}
            disabled={isLoading} 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button 
            type="button" 
            onClick={handlePublish}
            disabled={isLoading} 
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Publishing...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}