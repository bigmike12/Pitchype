"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Plus,
  Star,
  TrendingUp,
  Users,
  Zap,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useApplications } from "@/hooks/useApplications";
import { useTopPerformers } from "@/hooks/useTopPerformers";
import { toast } from "sonner";
import { MotionDiv } from "@/components/performance/LazyMotion";



const quickActions = [
  {
    title: "Create Campaign",
    description: "Launch a new influencer marketing campaign",
    icon: Plus,
    href: "/business/campaigns/create",
    color: "bg-primary",
  },
  {
    title: "Find Creators",
    description: "Discover and connect with top influencers",
    icon: Users,
    href: "/business/applications",
    color: "bg-blue-500",
  },
  {
    title: "View Analytics",
    description: "Track performance and campaign insights",
    icon: BarChart3,
    href: "/business/analytics",
    color: "bg-purple-500",
  },
  {
    title: "Messages",
    description: "Communicate with your creators",
    icon: MessageSquare,
    href: "/business/messages",
    color: "bg-green-500",
  },
];

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { campaigns, loading: loadingCampaigns } = useCampaigns();
  const { applications, loading: loadingApplications } = useApplications();
  
  const [stats, setStats] = useState([
    {
      title: "Active Campaigns",
      value: "0",
      change: "",
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Reach",
      value: "0",
      change: "",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Engagement Rate",
      value: "0%",
      change: "",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "Total Spent",
      value: "₦0",
      change: "",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]);
  
  // Use the new useTopPerformers hook
  const { topPerformers, loading: loadingTopPerformers } = useTopPerformers({ limit: 3 });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Calculate stats from campaigns data
  useEffect(() => {
    if (campaigns && !loadingCampaigns) {
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      const totalBudgetMin = campaigns.reduce((sum, c) => sum + (c.budget_min || 0), 0);
      
      setStats([
        {
          title: "Active Campaigns",
          value: activeCampaigns.toString(),
          change: "",
          icon: Zap,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Total Campaigns",
          value: campaigns.length.toString(),
          change: "",
          icon: Eye,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Applications",
          value: applications?.length?.toString() || "0",
          change: "",
          icon: Heart,
          color: "text-pink-600",
          bgColor: "bg-pink-100",
        },
        {
          title: "Total Budget",
          value: `₦${totalBudgetMin.toLocaleString()}`,
          change: "",
          icon: DollarSign,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ]);
      setLoadingStats(false);
    }
  }, [campaigns, applications, loadingCampaigns, loadingApplications]);
  
  // Top performers data is automatically fetched by the hook
  
  const isLoading = loadingCampaigns || loadingApplications || loadingStats;
  const recentCampaigns = campaigns?.slice(0, 3) || [];
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-cal font-bold text-gray-900">
              Welcome back, {user?.email?.split('@')[0] || 'there'}!
            </h1>
            <p className="text-gray-600 mt-1">
              You have {campaigns?.filter(c => c.status === 'active').length || 0} active campaigns and {applications?.filter(a => a.status === 'pending').length || 0} pending applications.
            </p>
          </div>
          <Link href="/business/campaigns/create">
            <Button className="bg-primary hover:bg-primary/90 shadow-apple">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>
      </MotionDiv>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <MotionDiv
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-apple hover:shadow-apple-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-cal font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
      </div>

      {/* Quick Actions */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-apple">
          <CardHeader>
            <CardTitle className="text-xl font-cal">Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={action.title} href={action.href}>
                  <MotionDiv
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </MotionDiv>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Campaigns */}
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-apple">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-cal">Recent Campaigns</CardTitle>
                <CardDescription>Your latest marketing campaigns</CardDescription>
              </div>
              <Link href="/business/campaigns">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No campaigns yet</p>
                    <p className="text-sm">Create your first campaign to get started</p>
                  </div>
                ) : (
                  recentCampaigns.map((campaign) => {
                    const applicationCount = applications?.filter(a => a.campaign_id === campaign.id).length || 0;
                    const approvedCount = applications?.filter(a => a.campaign_id === campaign.id && a.status === 'approved').length || 0;
                    const progress = campaign.required_influencers && campaign.required_influencers > 0 ? (approvedCount / campaign.required_influencers) * 100 : 0;
                    
                    return (
                      <Link key={campaign.id} href={`/business/campaigns/${campaign.id}`}>
                        <div className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                            <Badge
                              variant={campaign.status === "active" ? "default" : campaign.status === "completed" ? "secondary" : "outline"}
                              className={campaign.status === "active" ? "bg-green-100 text-green-700" : ""}
                            >
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">{approvedCount}</span> / {campaign.required_influencers || 0} creators
                            </div>
                            <div>
                              <span className="font-medium">{applicationCount}</span> applications
                            </div>
                            <div>
                              <span className="font-medium">₦{campaign.budget_min?.toLocaleString() || 0}</span> budget
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        {/* Top Influencers */}
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-apple">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-cal">Top Performers</CardTitle>
                <CardDescription>Your best performing creators</CardDescription>
              </div>
              <Link href="/business/applications">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingTopPerformers ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                  ))
                ) : topPerformers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No top performers yet</p>
                    <p className="text-sm">Approved applications will appear here</p>
                  </div>
                ) : (
                  topPerformers.map((influencer) => (
                    <div key={influencer.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{influencer.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{influencer.name}</h3>
                        <p className="text-sm text-gray-600">{influencer.handle}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium">{influencer.followers}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{influencer.engagement}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {influencer.niche || 'General'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
}