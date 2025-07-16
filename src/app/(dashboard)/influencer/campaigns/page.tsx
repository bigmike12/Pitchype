'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaigns } from '@/hooks/useCampaigns';

import { Search, Filter, Briefcase } from 'lucide-react';
import { CampaignCard } from '@/components/CampaignCard';



export default function InfluencerCampaignsPage() {
  const { campaigns, loading, error } = useCampaigns({ status: 'active' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'Fashion', 'Beauty', 'Fitness', 'Technology', 'Travel', 'Food', 'Lifestyle'];
  const statuses = ['all', 'open', 'in_review', 'closed'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'budget_high', label: 'Highest Budget' },
    { value: 'budget_low', label: 'Lowest Budget' },
    { value: 'deadline', label: 'Application Deadline' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (campaign.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (campaign.tags && campaign.tags.includes(selectedCategory));
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'budget_high':
        return (b.budget_max || 0) - (a.budget_max || 0);
      case 'budget_low':
        return (a.budget_min || 0) - (b.budget_min || 0);
      case 'deadline':
        if (!a.application_deadline || !b.application_deadline) return 0;
        return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
      case 'popular':
        return (b.view_count || 0) - (a.view_count || 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest first
    }
  });

  const formatBudget = (campaign: any) => {
    if (campaign.budget_min && campaign.budget_max) {
      if (campaign.budget_min === campaign.budget_max) {
        return `₦${campaign.budget_min.toLocaleString()}`;
      }
      return `₦${campaign.budget_min.toLocaleString()} - ₦${campaign.budget_max.toLocaleString()}`;
    }
    if (campaign.budget_min) {
      return `₦${campaign.budget_min.toLocaleString()}+`;
    }
    return 'Budget TBD';
  };

  // Campaign actions are handled by individual CampaignCard components internally

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Campaigns</h1>
          <p className="text-gray-600 mt-1">Discover and apply to campaigns that match your audience</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {sortedCampaigns.length} campaigns
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search campaigns, companies, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty === 'all' ? 'All Levels' : difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sortedCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CampaignCard campaign={campaign} />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {sortedCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedStatus('all');
            setSelectedDifficulty('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {sortedCampaigns.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Campaigns
          </Button>
        </div>
      )}
    </div>
  );
}

function Label({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <label className={`text-sm font-medium ${className || ''}`} {...props}>
      {children}
    </label>
  );
}