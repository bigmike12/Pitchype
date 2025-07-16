'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayoutRequests } from '@/hooks/usePayoutRequests';

interface InfluencerBalance {
  id: string;
  available: number;
  pending: number;
  total: number;
  currency: string;
}

interface PayoutRequest {
  id?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at?: string;
  processed_at?: string;
  notes?: string;
}

interface PayoutRequestProps {
  className?: string;
}

export default function PayoutRequest({ className }: PayoutRequestProps) {
  const {
    payouts,
    isLoading,
    isSubmitting,
    balance,
    platformSettings,
    fetchBalance,
    fetchPayouts,
    fetchPlatformSettings,
    requestPayout,
  } = usePayoutRequests();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
    fetchPayouts();
    fetchPlatformSettings();
  }, []);



  const calculatePayout = (amount: number) => {
      const platformFee = (amount * (platformSettings?.payout_fee_percentage || 0)) / 100;
      const netAmount = amount - platformFee;
      return { platformFee, netAmount };
    };

  const handlePayoutRequestSubmit = async () => {
    const amount = parseFloat(requestAmount);
    
    if (!amount || amount <= 0) {
      return;
    }

    if (!balance || amount > balance.available) {
      return;
    }

    if (!paymentMethod) {
      return;
    }

    try {
        await requestPayout(amount);
      
      setRequestAmount('');
      setPaymentMethod('');
      setShowRequestDialog(false);
      
      // Refresh data
      await fetchBalance();
      await fetchPayouts();
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading balance and payout history...</span>
      </div>
    );
  }

  const currentRequestAmount = parseFloat(requestAmount) || 0;
  const { platformFee, netAmount } = calculatePayout(currentRequestAmount);

  return (
    <div className={className}>
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

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {balance ? formatCurrency(balance.available) : '₦0'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">
                {balance ? formatCurrency(balance.pending) : '₦0'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">In escrow or processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {balance ? formatCurrency(balance.total) : '₦0'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout Button */}
      <div className="mb-6">
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button 
              disabled={!balance || balance.available <= 0}
              className="w-full md:w-auto"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Request a withdrawal from your available balance. A {platformSettings?.payout_fee_percentage || 0}% platform fee will be deducted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payout-amount">Amount (₦)</Label>
                <Input
                  id="payout-amount"
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  max={balance?.available || 0}
                  min="1"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {balance ? formatCurrency(balance.available) : '₦0'}
                </p>
              </div>

              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paystack">Paystack Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentRequestAmount > 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Requested Amount:</span>
                        <span>{formatCurrency(currentRequestAmount)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Platform Fee ({platformSettings?.payout_fee_percentage || 0}%):</span>
                        <span>-{formatCurrency(platformFee)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Net Amount:</span>
                        <span>{formatCurrency(netAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePayoutRequestSubmit} 
                disabled={isSubmitting || !requestAmount || !paymentMethod || currentRequestAmount <= 0}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Request Payout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your recent payout requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length > 0 ? (
            <div className="space-y-4">
              {payouts.map((request) => (
                <div key={request.id || Math.random()} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatCurrency(request.amount)}</span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span>Requested: {formatCurrency(request.amount)}</span>
                        {request.notes && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{request.notes}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {request.requested_at ? formatDate(request.requested_at) : 'N/A'}
                        {request.processed_at && (
                          <span> • Processed: {formatDate(request.processed_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payout requests yet</p>
              <p className="text-sm text-gray-400">Your payout history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
