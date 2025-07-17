'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Download, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Calendar, Receipt, Eye, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { usePayments } from '@/hooks/usePayments';

// Use the Payment interface from the hook
import { Payment } from '@/hooks/usePayments';
import { MotionDiv } from '@/components/performance/LazyMotion';

// Extended interface for UI display
interface PaymentDisplay extends Payment {
  influencer?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  method?: 'card' | 'bank_transfer' | 'paypal';
  createdAt?: string;
  processedAt?: string;
  description?: string;
  transactionId?: string;
  invoice?: {
    id: string;
    url: string;
  };
}

interface PaymentSummary {
  totalSpent: number;
  pendingPayments: number;
  completedPayments: number;
  thisMonth: number;
  lastMonth: number;
}

const mockPayments: PaymentDisplay[] = [
  {
    id: '1',
    amount: 800,
    status: 'completed',
    type: 'campaign_payment',
    created_at: '2024-01-20T10:30:00Z',
    campaign: {
      id: '1',
      title: 'Summer Collection Launch'
    },
    influencer: {
      id: '1',
      name: 'Sarah Johnson',
      username: '@sarahjstyle',
      avatar: '/api/placeholder/40/40'
    },
    method: 'card',
    createdAt: '2024-01-20T10:30:00Z',
    processedAt: '2024-01-20T10:32:00Z',
    description: 'Payment for Instagram posts and TikTok video',
    transactionId: 'txn_1234567890',
    invoice: {
      id: 'inv_001',
      url: '#'
    }
  },
  {
    id: '2',
    amount: 600,
    status: 'processing',
    type: 'campaign_payment',
    created_at: '2024-01-22T14:15:00Z',
    campaign: {
      id: '2',
      title: 'Fitness Gear Campaign'
    },
    influencer: {
      id: '2',
      name: 'Emma Davis',
      username: '@emmafashion',
      avatar: '/api/placeholder/40/40'
    },
    method: 'bank_transfer',
    createdAt: '2024-01-22T14:15:00Z',
    description: 'Payment for YouTube video and Instagram content',
    transactionId: 'txn_1234567891'
  },
  {
    id: '3',
    amount: 1200,
    status: 'pending',
    type: 'campaign_payment',
    created_at: '2024-01-23T09:45:00Z',
    campaign: {
      id: '3',
      title: 'Tech Product Review'
    },
    influencer: {
      id: '3',
      name: 'Alex Chen',
      username: '@alextech',
      avatar: '/api/placeholder/40/40'
    },
    method: 'card',
    createdAt: '2024-01-23T09:45:00Z',
    description: 'Payment for tech review video and social posts'
  },
  {
    id: '4',
    amount: 100,
    status: 'completed',
    type: 'bonus',
    created_at: '2024-01-21T16:20:00Z',
    campaign: {
      id: '1',
      title: 'Summer Collection Launch'
    },
    influencer: {
      id: '1',
      name: 'Sarah Johnson',
      username: '@sarahjstyle',
      avatar: '/api/placeholder/40/40'
    },
    method: 'card',
    createdAt: '2024-01-21T16:20:00Z',
    processedAt: '2024-01-21T16:22:00Z',
    description: 'Performance bonus for exceeding engagement targets',
    transactionId: 'txn_1234567892'
  },
  {
    id: '5',
    amount: 450,
    status: 'failed',
    type: 'campaign_payment',
    created_at: '2024-01-19T11:30:00Z',
    campaign: {
      id: '4',
      title: 'Holiday Campaign'
    },
    influencer: {
      id: '4',
      name: 'Maya Patel',
      username: '@mayastyle',
      avatar: '/api/placeholder/40/40'
    },
    method: 'card',
    createdAt: '2024-01-19T11:30:00Z',
    description: 'Payment for holiday content creation'
  }
];

const mockSummary: PaymentSummary = {
  totalSpent: 15750,
  pendingPayments: 1200,
  completedPayments: 14550,
  thisMonth: 3150,
  lastMonth: 4200
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

const statusIcons = {
  pending: Clock,
  processing: RefreshCw,
  completed: CheckCircle,
  failed: XCircle,
  refunded: AlertCircle
};

const typeColors = {
  campaign_payment: 'bg-blue-100 text-blue-800',
  bonus: 'bg-green-100 text-green-800',
  refund: 'bg-orange-100 text-orange-800'
};

const methodIcons = {
  card: CreditCard,
  bank_transfer: Receipt,
  paypal: DollarSign
};

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [summary, setSummary] = useState<PaymentSummary>(mockSummary);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDisplay | null>(null);
  const { user } = useAuth();

  const { payments, loading, error } = usePayments({
    businessId: user?.id,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    dateRange: dateRange !== 'all' ? dateRange : undefined
  });

  const filteredPayments = payments.filter(payment => {
    const paymentDisplay = payment as PaymentDisplay;
    const matchesSearch = (paymentDisplay.influencer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (paymentDisplay.influencer?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (payment.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (paymentDisplay.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const paymentDate = new Date(paymentDisplay.createdAt || payment.created_at);
      const now = new Date();
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      matchesDate = paymentDate >= cutoffDate;
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const getStatusCounts = () => {
    return {
      all: payments.length,
      pending: payments.filter(p => p.status === 'pending').length,
      processing: payments.filter(p => p.status === 'processing').length,
      completed: payments.filter(p => p.status === 'completed').length,
      failed: payments.filter(p => p.status === 'failed').length
    };
  };

  const statusCounts = getStatusCounts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return '0';
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const monthChange = getChangePercentage(summary.thisMonth, summary.lastMonth);
  const isPositiveChange = parseFloat(monthChange) > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Filters skeleton */}
        <div className="flex items-center space-x-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Payments table skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {/* Table header */}
              <div className="grid grid-cols-6 gap-4 pb-2 border-b border-gray-200">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
              
              {/* Table rows */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 py-3">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && payments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage campaign payments and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.pendingPayments)}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.thisMonth)}</p>
                  <div className={`flex items-center gap-1 text-sm ${
                    isPositiveChange ? 'text-red-600' : 'text-green-600'
                  }`}>
                    <span>{isPositiveChange ? '+' : ''}{monthChange}% from last month</span>
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.completedPayments)}</p>
                  <p className="text-sm text-gray-600">{statusCounts.completed} transactions</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by influencer, campaign, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="campaign_payment">Campaign Payment</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment, index) => {
          const paymentDisplay = payment as PaymentDisplay;
          const StatusIcon = statusIcons[payment.status as keyof typeof statusIcons];
          const MethodIcon = methodIcons[paymentDisplay.method as keyof typeof methodIcons] || CreditCard;
          
          return (
            <MotionDiv
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar>
                        <AvatarImage src={paymentDisplay.influencer?.avatar} />
                        <AvatarFallback>
                          {paymentDisplay.influencer?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{paymentDisplay.influencer?.name || 'Unknown'}</h3>
                          <Badge className={statusColors[payment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {payment.status}
                            </Badge>
                            <Badge className={typeColors[payment.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
                              {payment.type.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{paymentDisplay.influencer?.username || ''}</p>
                        <Link 
                          href={`/business/campaigns/${payment.campaign?.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 mb-2 block"
                        >
                          {payment.campaign?.title || 'Unknown Campaign'}
                        </Link>
                        <p className="text-sm text-gray-700 mb-2">{paymentDisplay.description || ''}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MethodIcon className="w-3 h-3" />
                            {paymentDisplay.method?.replace('_', ' ') || 'Unknown'}
                          </div>
                          <span>Created: {new Date(paymentDisplay.createdAt || payment.created_at).toLocaleDateString()}</span>
                          {paymentDisplay.processedAt && (
                            <span>Processed: {new Date(paymentDisplay.processedAt).toLocaleDateString()}</span>
                          )}
                          {paymentDisplay.transactionId && (
                            <span>ID: {paymentDisplay.transactionId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedPayment(payment as PaymentDisplay)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                              <DialogDescription>
                                Transaction information for {paymentDisplay.influencer?.name || 'Unknown'}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedPayment && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Amount</label>
                                    <p className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={statusColors[selectedPayment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {selectedPayment.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <MethodIcon className="w-4 h-4" />
                                      <span className="capitalize">{selectedPayment.method?.replace('_', ' ') || 'Unknown'}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Type</label>
                                    <Badge className={typeColors[selectedPayment.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'} variant="outline">
                                      {selectedPayment.type.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Created</label>
                                    <p>{new Date(selectedPayment.createdAt || selectedPayment.created_at).toLocaleString()}</p>
                                  </div>
                                  {selectedPayment.processedAt && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Processed</label>
                                      <p>{new Date(selectedPayment.processedAt).toLocaleString()}</p>
                                    </div>
                                  )}
                                </div>
                                
                                {selectedPayment.transactionId && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                                      {selectedPayment.transactionId}
                                    </p>
                                  </div>
                                )}
                                
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Description</label>
                                  <p className="text-gray-700">{selectedPayment.description}</p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  {selectedPayment.invoice && (
                                    <Button variant="outline" size="sm">
                                      <Receipt className="w-4 h-4 mr-1" />
                                      Download Invoice
                                    </Button>
                                  )}
                                  {selectedPayment.status === 'failed' && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      <RefreshCw className="w-4 h-4 mr-1" />
                                      Retry Payment
                                    </Button>
                                  )}
                                  {selectedPayment.status === 'completed' && (
                                    <Button variant="outline" size="sm">
                                      <AlertCircle className="w-4 h-4 mr-1" />
                                      Request Refund
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {(payment as PaymentDisplay).invoice && (
                          <Button variant="outline" size="sm">
                            <Receipt className="w-4 h-4 mr-1" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          );
        })}
      </div>

      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Payment transactions will appear here'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}