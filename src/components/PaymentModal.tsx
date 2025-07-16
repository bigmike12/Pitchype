'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Shield, AlertCircle } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  campaignBudget: number;
  applicationId: string;
  businessEmail: string;
}

interface PaymentConfig {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  campaignBudget,
  applicationId,
  businessEmail
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate transaction fee (5% capped at ₦2,000)
  const transactionFeeRate = 0.05;
  const transactionFeeCap = 2000;
  const calculatedFee = campaignBudget * transactionFeeRate;
  const transactionFee = Math.min(calculatedFee, transactionFeeCap);
  const totalAmount = campaignBudget + transactionFee;
  
  // Generate unique reference
  const reference = `pitchype_${applicationId}_${Date.now()}`;
  
  const config: PaymentConfig = {
    reference,
    email: businessEmail,
    amount: Math.round(totalAmount * 100), // Paystack expects amount in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };
  
  const initializePayment = usePaystackPayment(config);
  
  const handlePayment = () => {
    setIsProcessing(true);
    
    // Close the payment modal when Paystack modal opens
    onClose();
    
    initializePayment({
      onSuccess: (response: any) => {
        setIsProcessing(false);
        onSuccess(response.reference);
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Campaign Budget</span>
                  <span className="font-medium">{formatCurrency(campaignBudget)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Transaction Fee (5%, max ₦2,000)
                  </span>
                  <span className="font-medium">{formatCurrency(transactionFee)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Escrow Protection</p>
                <p className="text-xs mt-1">
                  Funds will be held in escrow until the influencer completes the campaign deliverables.
                </p>
              </div>
            </div>
          </div>
          
          {!config.publicKey && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Payment Configuration Error</p>
                  <p className="text-xs mt-1">
                    Paystack public key is not configured. Please contact support.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={isProcessing || !config.publicKey}
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}