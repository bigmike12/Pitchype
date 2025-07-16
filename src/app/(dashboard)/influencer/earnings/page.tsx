'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePayments } from '@/hooks/usePayments';
import { usePayoutRequests } from '@/hooks/usePayoutRequests';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Search, Filter, CreditCard, Clock, CheckCircle, AlertCircle, BarChart3, PieChart, Wallet, Plus } from 'lucide-react';

interface EarningsStats {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pending: number;
  paid: number;
  averagePerCampaign: number;
  totalCampaigns: number;
  growthRate: number;
}

export default function EarningsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  // Fetch payments (earnings) data
  const { payments: earnings, loading: earningsLoading, error: earningsError, refetch: refetchEarnings } = usePayments({
    influencerId: user?.id,
    limit: 100
  });

  // Fetch payout data and balance
  const {
    balance,
    payouts,
    platformSettings,
    isLoading: payoutLoading,
    isSubmitting,
    requestPayout
  } = usePayoutRequests();

  console.log("balance", balance);

  const statuses = ['all', 'pending', 'processing', 'paid', 'completed', 'failed', 'rejected'];
  const periods = [
    { value: 'all_time', label: 'All Time' },
    { value: 'this_year', label: 'This Year' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' }
  ];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount_high', label: 'Highest Amount' },
    { value: 'amount_low', label: 'Lowest Amount' },
    { value: 'status', label: 'Status' }
  ];

  // Calculate stats from real data
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const totalEarnings = earnings.reduce((sum, payment) => sum + payment.amount, 0);
    const thisMonthEarnings = earnings
      .filter(payment => new Date(payment.created_at) >= thisMonth)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const lastMonthEarnings = earnings
      .filter(payment => {
        const date = new Date(payment.created_at);
        return date >= lastMonth && date <= lastMonthEnd;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingEarnings = earnings
      .filter(payment => payment.status === 'pending' || payment.status === 'processing')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const paidEarnings = earnings
      .filter(payment => payment.status === 'completed' || payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalCampaigns = new Set(earnings.map(payment => payment.application_id)).size;
    const averagePerCampaign = totalCampaigns > 0 ? totalEarnings / totalCampaigns : 0;
    const growthRate = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 : 0;

    return {
      totalEarnings,
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      pending: pendingEarnings,
      paid: paidEarnings,
      averagePerCampaign,
      totalCampaigns,
      growthRate
    };
  }, [earnings]);

  const filteredEarnings = earnings.filter(earning => {
    const campaignTitle = earning.campaign?.title || earning.application?.campaign?.title || '';
    const matchesSearch = campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         earning.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || earning.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedEarnings = [...filteredEarnings].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'amount_high':
        return b.amount - a.amount;
      case 'amount_low':
        return a.amount - b.amount;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handlePayoutRequest = async () => {
    if (!payoutAmount || !balance) return;
    
    const amount = parseFloat(payoutAmount);
    if (amount <= 0 || amount > balance.available) {
      toast.error('Invalid payout amount');
      return;
    }

    if (platformSettings && amount < platformSettings.minimum_payout_amount) {
      toast.error(`Minimum payout amount is ₦${platformSettings.minimum_payout_amount}`);
      return;
    }

    try {
      await requestPayout(amount);
      setShowPayoutDialog(false);
      setPayoutAmount('');
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'failed':
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <CreditCard className="w-4 h-4" />;
      case 'paypal': return <Wallet className="w-4 h-4" />;
      case 'stripe': return <CreditCard className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthIndicator = (rate: number) => {
    const isPositive = rate > 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(rate)}%
      </div>
    );
  };

  if (earningsLoading || payoutLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (earningsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Earnings</h2>
          <p className="text-gray-600 mb-4">{earningsError}</p>
          <Button onClick={refetchEarnings}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your payments and financial performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Payout</DialogTitle>
                <DialogDescription>
                   Request a payout from your available balance. 
                   {platformSettings && (
                     <>Minimum amount: ₦{platformSettings.minimum_payout_amount || ""}</>  
                   )}
                 </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Available Balance</label>
                  <p className="text-2xl font-bold text-green-600">
                    {balance ? formatCurrency(balance.available ) : formatCurrency(0)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Payout Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    max={balance?.available || 0}
                    min={platformSettings?.minimum_payout_amount || 0}
                  />
                </div>
                {platformSettings && (
                  <div className="text-sm text-gray-600">
                    <p>Processing fee: {platformSettings.payout_fee_percentage}%</p>
                    <p>Processing time: {platformSettings.payout_processing_days} business days</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePayoutRequest}
                  disabled={isSubmitting || !payoutAmount || parseFloat(payoutAmount) <= 0}
                >
                  {isSubmitting ? 'Processing...' : 'Request Payout'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Balance and Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">Available Balance</p>
                  <p className="text-2xl font-bold">{balance ? formatCurrency(balance.available) : formatCurrency(0)}</p>
                  <p className="text-sm text-green-100">Ready to withdraw</p>
                </div>
                <Wallet className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                  {getGrowthIndicator(stats.growthRate)}
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</p>
                  <p className="text-sm text-gray-600">vs {formatCurrency(stats.lastMonth)} last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{balance ? formatCurrency(balance.pending) : formatCurrency(stats.pending)}</p>
                  <p className="text-sm text-gray-600">Awaiting payment</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg per Campaign</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.averagePerCampaign)}</p>
                  <p className="text-sm text-gray-600">{stats.totalCampaigns} campaigns</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search earnings, campaigns, or payment IDs..."
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
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="bonus">Bonuses</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
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
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Earnings List */}
      <div className="space-y-4">
        {sortedEarnings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
              <p className="text-gray-600">Complete campaigns to start earning money!</p>
            </CardContent>
          </Card>
        ) : (
          sortedEarnings.map((earning, index) => {
            const campaignTitle = earning.campaign?.title || earning.application?.campaign?.title || 'Unknown Campaign';
            const campaignId = earning.campaign?.id || earning.application?.campaign?.id || earning.application_id;
            
            return (
              <motion.div
                key={earning.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                          {campaignTitle[0] || 'C'}
                        </div>
                        <div>
                          <h3 className="font-semibold">{campaignTitle}</h3>
                          <p className="text-sm text-gray-600">Payment ID: {earning.id}</p>
                          <Badge variant="outline" className="mt-1">
                            {earning.type || 'payment'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(earning.amount)}</p>
                        <Badge className={getStatusColor(earning.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(earning.status)}
                            {earning.status}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Payment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Application ID</p>
                        <p className="font-medium">{earning.application_id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Type</p>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-medium capitalize">
                            {earning.type || 'Payment'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created Date</p>
                        <p className="font-medium">{new Date(earning.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Payment Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-green-600">{formatCurrency(earning.amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge className={getStatusColor(earning.status)}>
                            {earning.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Campaign ID</p>
                          <p className="font-medium">{campaignId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="font-medium">{new Date(earning.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Payout History Section */}
      {payouts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payout History</h2>
          <div className="space-y-4">
            {payouts.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Payout Request</h3>
                          <p className="text-sm text-gray-600">
                            {payout.requested_at ? new Date(payout.requested_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(payout.amount)}</p>
                        <Badge className={getStatusColor(payout.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(payout.status)}
                            {payout.status}
                          </div>
                        </Badge>
                      </div>
                    </div>
                    {payout.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{payout.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}