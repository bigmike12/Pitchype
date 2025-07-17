"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
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
import { useRecentEarnings } from "@/hooks/usePayments";
import { toast } from "sonner";
import { MotionDiv } from "@/components/performance/LazyMotion";

const getStats = (applications: any[]) => [
  {
    title: "Total Earnings",
    value: `₦${applications
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + ((app as any).proposed_rate || (app as any).proposedRate || 0), 0)
      .toLocaleString()}`,
    change: "From approved campaigns",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Active Campaigns",
    value: applications.filter(app => app.status === 'approved').length.toString(),
    change: "Approved applications",
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Total Applications",
    value: applications.length.toString(),
    change: `${applications.filter(app => app.status === 'pending').length} pending`,
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Success Rate",
    value: `${applications.length > 0 
      ? Math.round((applications.filter(app => app.status === 'approved').length / applications.length) * 100)
      : 0}%`,
    change: "Application approval",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];



export default function InfluencerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const { user } = useAuth();
  
  const { campaigns, loading: campaignsLoading, error: campaignsError } = useCampaigns({
    status: 'active'
  });
  
  const { 
    applications: myApplications, 
    loading: applicationsLoading, 
    error: applicationsError,
    createApplication 
  } = useApplications({ 
    influencerId: user?.id
  });

  // Use the new hooks for active campaigns and recent earnings
  const { 
    applications: activeCampaigns, 
    loading: loadingActiveCampaigns 
  } = useApplications({
    influencerId: user?.id,
    status: 'approved'
  });

  const { 
    payments: recentEarnings, 
    loading: loadingEarnings 
  } = useRecentEarnings(4);

  // Data fetching is now handled by hooks

  const handleApplyToCampaign = async (campaignId: string) => {
    try {
      await createApplication({
        campaign_id: campaignId,
        proposal: 'I am interested in this campaign and would love to collaborate.',
        proposed_rate: undefined
      });
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const formatBudget = (min: number, max: number) => {
    if (!min && !max) return 'Budget not specified';
    if (!max) return `₦${min?.toLocaleString()}+`;
    if (!min) return `Up to ₦${max?.toLocaleString()}`;
    return `₦${min?.toLocaleString()} - ₦${max?.toLocaleString()}`;
  };

  const isLoading = campaignsLoading || applicationsLoading || loadingActiveCampaigns || loadingEarnings;
  const hasError = campaignsError || applicationsError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Main content grid skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Available campaigns skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent applications skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {campaignsError || applicationsError}</p>
      </div>
    );
  }

  const stats = getStats(myApplications);

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
              Welcome back!
            </h1>
            <p className="text-gray-600 mt-1">
              You have {myApplications.filter(app => app.status === 'pending').length} pending applications and {campaigns.length} new opportunities.
            </p>
          </div>
          <Link href="/influencer/applications">
            <Button className="bg-primary hover:bg-primary/90 shadow-apple">
              <Star className="mr-2 h-4 w-4" />
              Discover Campaigns
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
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-cal font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Campaigns */}
        <MotionDiv
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-apple">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-cal">
                  Active Campaigns
                </CardTitle>
                <CardDescription>
                  Your current brand partnerships
                </CardDescription>
              </div>
              <Link href="/influencer/applications">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingActiveCampaigns ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-2">
                          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))
                ) : activeCampaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active campaigns yet</p>
                    <p className="text-sm text-gray-500">Apply to campaigns to see them here</p>
                  </div>
                ) : (
                  activeCampaigns.map((application) => (
                    <div
                      key={application.id}
                      className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {application.campaign?.title || 'Campaign Title'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {application.campaign?.business?.company_name || 'Brand Name'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(application.campaign as any)?.platform || 'Multi-platform'}
                          </p>
                        </div>
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-700"
                        >
                          {application.status === 'approved' ? 'Active' : application.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {(application.campaign as any)?.deadline
                                ? new Date((application.campaign as any).deadline).toLocaleDateString()
                                : 'No deadline'
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium">
                              ₦{application.proposed_rate?.toLocaleString() || 'TBD'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: '60%' }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        {/* Recent Earnings */}
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-apple">
            <CardHeader>
              <CardTitle className="text-xl font-cal">
                Recent Earnings
              </CardTitle>
              <CardDescription>Your latest payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loadingEarnings ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                      <div className="space-y-2">
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                  ))
                ) : recentEarnings.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No earnings yet</p>
                    <p className="text-sm text-gray-500">Complete campaigns to see earnings here</p>
                  </div>
                ) : (
                  recentEarnings.map((payment, index) => (
                    <div
                      key={payment.id || index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          ₦{payment.amount?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {payment.application?.campaign?.title || 'Campaign'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'Date unknown'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          payment.status === "paid" ? "default" : "outline"
                        }
                        className={
                          payment.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : ""
                        }
                      >
                        {payment.status === 'paid' ? 'Completed' : payment.status || 'Pending'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <Link href="/influencer/earnings">
                <Button variant="outline" className="w-full mt-4">
                  View All Earnings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      {/* Recommended Campaigns */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-apple">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-cal">
                Recommended for You
              </CardTitle>
              <CardDescription>
                Campaigns that match your profile and interests
              </CardDescription>
            </div>
            <Link href="/influencer/campaigns">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.slice(0, 6).map((campaign) => (
                <MotionDiv
                  key={campaign.id}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-gray-600">{campaign.business?.company_name || 'Unknown Brand'}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-gray-600">95%</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{(campaign as any).platform || 'Multi-platform'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payment:</span>
                      <span className="font-medium text-green-600">
                        {formatBudget((campaign as any).budget_min, (campaign as any).budget_max)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Deadline:</span>
                      <span className="font-medium">
                        {(campaign as any).deadline ? new Date((campaign as any).deadline).toLocaleDateString() : 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant="outline" className="text-xs">
                      {(campaign as any).category || 'General'}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-orange-600">
                      <Clock className="h-3 w-3" />
                      <span>5 days left</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3 bg-primary hover:bg-primary/90"
                    size="sm"
                    onClick={() => handleApplyToCampaign(campaign.id)}
                    disabled={myApplications.some(app => app.campaign_id === campaign.id)}
                  >
                    {myApplications.some(app => app.campaign_id === campaign.id) ? 'Applied' : 'Apply Now'}
                  </Button>
                </MotionDiv>
              ))}
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
