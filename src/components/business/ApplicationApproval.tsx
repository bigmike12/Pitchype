"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Check,
  X,
  DollarSign,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";
import PaymentModal from "../PaymentModal";
import { useAuth } from "@/contexts/AuthContext";
import { useApplication } from "@/hooks/useApplications";

interface ApplicationApprovalProps {
  application: {
    id: string;
    proposal: string;
    proposed_rate?: number;
    estimated_reach?: number;
    portfolio_links?: string[];
    status: string;
    created_at: string;
    influencer: {
      id: string;
      influencer_profiles: {
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        bio: string | null;
        social_links: any;
      };
    };
    campaign: {
      id: string;
      title: string;
      budget_min?: number;
      budget_max?: number;
    };
  };
  onStatusUpdate: (applicationId: string, status: string) => void;
}

export function ApplicationApproval({
  application,
  onStatusUpdate,
}: ApplicationApprovalProps) {
  const { user } = useAuth();
  const { updateApplication } = useApplication(application.id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );

  const businessEmail = user?.email;

  const influencerProfile = application.influencer;
  const influencerName =
    `${influencerProfile?.influencer_profiles?.first_name || ""} ${influencerProfile?.influencer_profiles?.last_name || ""}`.trim() ||
    "Unknown Influencer";
  const paymentAmount =
    application.proposed_rate || application.campaign.budget_min || 0;

  console.log("user", influencerProfile);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await updateApplication({
        status: "approved",
      });
      
      toast.success(
        "Application approved successfully! Payment has been initiated."
      );
      onStatusUpdate(application.id, "approved");
      setShowPaymentModal(false);
      setFeedback("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve application");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await updateApplication({
        status: "rejected",
      });
      
      toast.success("Application rejected");
      onStatusUpdate(application.id, "rejected");
      setShowFeedbackDialog(false);
      setFeedback("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject application");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (reference: string) => {
    toast.success("Payment processed successfully!");
    handleApprove();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {influencerProfile.influencer_profiles?.first_name?.charAt(0)}
              {influencerProfile.influencer_profiles?.last_name?.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{influencerName}</CardTitle>
              <CardDescription>
                {influencerProfile.influencer_profiles?.bio || "Influencer"}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campaign Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm text-gray-700 mb-1">Campaign</h4>
          <p className="text-sm">{application.campaign.title}</p>
        </div>

        {/* Proposal */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Proposal</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {application.proposal}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {application.proposed_rate && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Proposed Rate</p>
                <p className="font-semibold">
                  ₦{application.proposed_rate.toLocaleString()}
                </p>
              </div>
            </div>
          )}
          {application.estimated_reach && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Estimated Reach</p>
                <p className="font-semibold">
                  {application.estimated_reach.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Links */}
        {application.portfolio_links &&
          application.portfolio_links.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Portfolio
              </h4>
              <div className="space-y-1">
                {application.portfolio_links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline block"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        {application.status === "pending" && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve & Pay
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setActionType("reject");
                setShowFeedbackDialog(true);
              }}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        campaignBudget={paymentAmount}
        applicationId={application.id}
        businessEmail={businessEmail || "Pitchype@gmail.com"}
      />

      {/* Feedback Dialog */}
      {showFeedbackDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === "reject"
                ? "Reject Application"
                : "Provide Feedback"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide feedback to the influencer..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={
                    actionType === "reject" ? handleReject : handleApprove
                  }
                  disabled={isProcessing}
                  className={
                    actionType === "reject" ? "bg-red-600 hover:bg-red-700" : ""
                  }
                >
                  {isProcessing
                    ? "Processing..."
                    : actionType === "reject"
                      ? "Reject"
                      : "Confirm"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackDialog(false);
                    setFeedback("");
                    setActionType(null);
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
