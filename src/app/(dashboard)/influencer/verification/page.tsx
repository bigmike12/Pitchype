"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/client";
import { useVerification } from "@/hooks/useVerification";
import SocialMediaVerificationForm from "@/components/social-media/SocialMediaVerificationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Instagram,
  Youtube,
  Twitter,
  ExternalLink,
  Calendar,
  Users,
  AlertTriangle,
  Copy,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const platformConfig = {
  instagram: {
    icon: Instagram,
    label: "Instagram",
    color: "bg-pink-100 text-pink-800",
  },
  youtube: {
    icon: Youtube,
    label: "YouTube",
    color: "bg-red-100 text-red-800",
  },
  tiktok: {
    icon: Twitter, // Using Twitter icon as placeholder
    label: "TikTok",
    color: "bg-black text-white",
  },
  twitter: {
    icon: Twitter,
    label: "Twitter",
    color: "bg-blue-100 text-blue-800",
  },
};

const statusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    label: "Pending Review",
  },
  verified: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Verified",
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Rejected",
  },
};

export default function SocialMediaVerificationPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  // Use the verification hook with proper dependency
  const {
    verifications,
    loading: verificationsLoading,
    error: verificationsError,
    stats,
    refetch: refetchVerifications,
  } = useVerification({ influencerId: user?.id });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state with timeout fallback
  if (!mounted || loading || (verificationsLoading && !verifications)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading verification data...</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Handle authentication failures
  if (!user || (userProfile && userProfile.user_role !== "influencer")) {
    return null;
  }

  // Show error state if verification data failed to load
  if (verificationsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load verification data: {verificationsError}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={refetchVerifications}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Use stats from the hook
  const {
    verified: verifiedAccounts,
    pending: pendingReview,
    totalFollowers,
    trustScore,
  } = stats;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Media Verification</h1>
        <p className="text-gray-600">
          Verify your social media accounts to build trust and unlock premium
          features
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Verified Accounts
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {verifiedAccounts}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingReview}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Followers
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalFollowers >= 1000000
                    ? `${(totalFollowers / 1000000).toFixed(1)}M`
                    : totalFollowers >= 1000
                      ? `${(totalFollowers / 1000).toFixed(1)}K`
                      : totalFollowers.toString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trust Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {trustScore}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status */}
      {verifications && verifications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Verification Status</CardTitle>
            <CardDescription>
              Track the status of your social media verification requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verifications.map((verification) => {
                const platform =
                  platformConfig[
                    verification.platform as keyof typeof platformConfig
                  ];
                const status =
                  statusConfig[
                    verification.status as keyof typeof statusConfig
                  ];
                const PlatformIcon = platform.icon;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={verification.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <PlatformIcon className="h-5 w-5" />
                        <Badge className={platform.color}>
                          {platform.label}
                        </Badge>
                      </div>

                      <div>
                        <p className="font-medium">{verification.username}</p>
                        <p className="text-sm text-gray-600">
                          {verification.follower_count?.toLocaleString()}{" "}
                          followers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(
                            new Date(verification.created_at),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(verification.profile_url, "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form */}
      <SocialMediaVerificationForm
        onVerificationSubmitted={refetchVerifications}
      />

      {/* Benefits Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Verification Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700">
                For Influencers
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Build trust with potential business partners</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Get priority in campaign applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Access to premium campaign opportunities</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Higher visibility in search results</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Verified badge on your profile</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-blue-700">For Businesses</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Confidence in influencer authenticity</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Verified follower counts and metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Reduced risk of fake accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Better ROI on marketing investments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Access to verified influencer pool</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Process */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Verification Process</CardTitle>
          <CardDescription>
            How we verify your social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Submit Request</h4>
              <p className="text-sm text-gray-600">
                Fill out the verification form with your account details and
                upload supporting documents
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Admin Review</h4>
              <p className="text-sm text-gray-600">
                Our team reviews your account, checks authenticity, and verifies
                the provided information
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Get Verified</h4>
              <p className="text-sm text-gray-600">
                Once approved, you'll receive a verified badge and unlock
                premium features
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Review Time:</strong> Verification requests are typically
              processed within 2-3 business days. You'll receive an email
              notification once your request has been reviewed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
