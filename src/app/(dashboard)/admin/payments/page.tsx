'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, MoreHorizontal, Eye, Download, DollarSign, CreditCard, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Users, Building2, Star, Calendar, RefreshCw, Ban, FileText, MessageSquare } from 'lucide-react';

interface Payment {
  id: string;
  transactionId: string;
  type: 'campaign_payment' | 'platform_fee' | 'refund' | 'withdrawal' | 'deposit';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed' | 'refunded' | 'cancelled';
  amount: number;
  platformFee: number;
  netAmount: number;
  currency: 'NGN';
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'stripe';
  from: {
    id: string;
    name: string;
    type: 'business' | 'influencer' | 'platform';
    email: string;
  };
  to: {
    id: string;
    name: string;
    type: 'business' | 'influencer' | 'platform';
    email: string;
  };
  campaign?: {
    id: string;
    title: string;
  };
  createdAt: string;
  processedAt?: string;
  description: string;
  metadata: {
    gateway: string;
    gatewayTransactionId?: string;
    failureReason?: string;
    disputeReason?: string;
  };
  flags: {
    suspicious: boolean;
    highValue: boolean;
    frequentUser: boolean;
  };
}

const mockPayments: Payment[] = [
  {
    id: '1',
    transactionId: 'TXN-2024-001',
    type: 'campaign_payment',
    status: 'completed',
    amount: 1500,
    platformFee: 150,
    netAmount: 1350,
    currency: 'NGN',
    paymentMethod: 'card',
    from: {
      id: 'b1',
      name: 'StyleCorp',
      type: 'business',
      email: 'contact@stylecorp.com'
    },
    to: {
      id: 'i1',
      name: 'Emma Wilson',
      type: 'influencer',
      email: 'emma.wilson@email.com'
    },
    campaign: {
      id: 'c1',
      title: 'Summer Fashion Collection Launch'
    },
    createdAt: '2024-02-01T10:00:00Z',
    processedAt: '2024-02-01T10:05:00Z',
    description: 'Payment for completed campaign deliverables',
    metadata: {
      gateway: 'Stripe',
      gatewayTransactionId: 'pi_1234567890'
    },
    flags: {
      suspicious: false,
      highValue: true,
      frequentUser: true
    }
  },
  {
    id: '2',
    transactionId: 'TXN-2024-002',
    type: 'platform_fee',
    status: 'completed',
    amount: 150,
    platformFee: 0,
    netAmount: 150,
    currency: 'NGN',
    paymentMethod: 'card',
    from: {
      id: 'b1',
      name: 'StyleCorp',
      type: 'business',
      email: 'contact@stylecorp.com'
    },
    to: {
      id: 'platform',
      name: 'Pitchype Platform',
      type: 'platform',
      email: 'payments@pitchype.com'
    },
    campaign: {
      id: 'c1',
      title: 'Summer Fashion Collection Launch'
    },
    createdAt: '2024-02-01T10:00:00Z',
    processedAt: '2024-02-01T10:01:00Z',
    description: 'Platform commission fee (10%)',
    metadata: {
      gateway: 'Stripe',
      gatewayTransactionId: 'pi_1234567891'
    },
    flags: {
      suspicious: false,
      highValue: false,
      frequentUser: true
    }
  },
  {
    id: '3',
    transactionId: 'TXN-2024-003',
    type: 'campaign_payment',
    status: 'disputed',
    amount: 2500,
    platformFee: 250,
    netAmount: 2250,
    currency: 'NGN',
    paymentMethod: 'bank_transfer',
    from: {
      id: 'b2',
      name: 'TechNova',
      type: 'business',
      email: 'hello@technova.io'
    },
    to: {
      id: 'i2',
      name: 'Alex Johnson',
      type: 'influencer',
      email: 'alex.j@email.com'
    },
    campaign: {
      id: 'c2',
      title: 'Tech Product Review Campaign'
    },
    createdAt: '2024-01-28T14:30:00Z',
    description: 'Payment for tech product review content',
    metadata: {
      gateway: 'Paystack',
      disputeReason: 'Content did not meet quality standards'
    },
    flags: {
      suspicious: true,
      highValue: true,
      frequentUser: false
    }
  },
  {
    id: '4',
    transactionId: 'TXN-2024-004',
    type: 'withdrawal',
    status: 'processing',
    amount: 5000,
    platformFee: 25,
    netAmount: 4975,
    currency: 'NGN',
    paymentMethod: 'bank_transfer',
    from: {
      id: 'i3',
      name: 'Sarah Chen',
      type: 'influencer',
      email: 'sarah.chen@email.com'
    },
    to: {
      id: 'bank',
      name: 'Bank Account',
      type: 'platform',
      email: ''
    },
    createdAt: '2024-02-01T09:15:00Z',
    description: 'Withdrawal to bank account',
    metadata: {
      gateway: 'Paystack'
    },
    flags: {
      suspicious: false,
      highValue: true,
      frequentUser: true
    }
  },
  {
    id: '5',
    transactionId: 'TXN-2024-005',
    type: 'refund',
    status: 'completed',
    amount: 800,
    platformFee: -80,
    netAmount: 720,
    currency: 'NGN',
    paymentMethod: 'card',
    from: {
      id: 'platform',
      name: 'Pitchype Platform',
      type: 'platform',
      email: 'payments@pitchype.com'
    },
    to: {
      id: 'b3',
      name: 'FitTech Solutions',
      type: 'business',
      email: 'info@fittech.com'
    },
    campaign: {
      id: 'c3',
      title: 'Fitness Challenge Promotion'
    },
    createdAt: '2024-01-30T16:45:00Z',
    processedAt: '2024-01-30T16:50:00Z',
    description: 'Refund for cancelled campaign',
    metadata: {
      gateway: 'Stripe',
      gatewayTransactionId: 'pi_1234567892'
    },
    flags: {
      suspicious: false,
      highValue: false,
      frequentUser: true
    }
  },
  {
    id: '6',
    transactionId: 'TXN-2024-006',
    type: 'campaign_payment',
    status: 'failed',
    amount: 1200,
    platformFee: 120,
    netAmount: 1080,
    currency: 'NGN',
    paymentMethod: 'card',
    from: {
      id: 'b4',
      name: 'QuickEats',
      type: 'business',
      email: 'payments@quickeats.com'
    },
    to: {
      id: 'i4',
      name: 'Mike Rodriguez',
      type: 'influencer',
      email: 'mike.r@email.com'
    },
    campaign: {
      id: 'c4',
      title: 'Food Delivery App Launch'
    },
    createdAt: '2024-02-01T11:20:00Z',
    description: 'Payment for food delivery promotion',
    metadata: {
      gateway: 'Stripe',
      failureReason: 'Insufficient funds'
    },
    flags: {
      suspicious: false,
      highValue: false,
      frequentUser: true
    }
  }
];

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.to.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesType = selectedType === 'all' || payment.type === selectedType;
    const matchesMethod = selectedMethod === 'all' || payment.paymentMethod === selectedMethod;
    
    return matchesSearch && matchesStatus && matchesType && matchesMethod;
  });

  const paymentStats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    processing: payments.filter(p => p.status === 'processing').length,
    failed: payments.filter(p => p.status === 'failed').length,
    disputed: payments.filter(p => p.status === 'disputed').length,
    totalVolume: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    totalFees: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.platformFee, 0),
    flagged: payments.filter(p => p.flags.suspicious || p.flags.highValue).length
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'campaign_payment': return 'bg-blue-100 text-blue-800';
      case 'platform_fee': return 'bg-green-100 text-green-800';
      case 'refund': return 'bg-orange-100 text-orange-800';
      case 'withdrawal': return 'bg-purple-100 text-purple-800';
      case 'deposit': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'refunded': return <RefreshCw className="w-4 h-4 text-purple-500" />;
      case 'cancelled': return <Ban className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'bank_transfer': return <Building2 className="w-4 h-4" />;
      case 'paypal': return <DollarSign className="w-4 h-4" />;
      case 'stripe': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const handlePaymentAction = (paymentId: string, action: string) => {
    setPayments(prev => prev.map(payment => {
      if (payment.id === paymentId) {
        switch (action) {
          case 'approve':
            return { ...payment, status: 'completed' as const, processedAt: new Date().toISOString() };
          case 'reject':
            return { ...payment, status: 'failed' as const };
          case 'refund':
            return { ...payment, status: 'refunded' as const };
          case 'retry':
            return { ...payment, status: 'processing' as const };
          default:
            return payment;
        }
      }
      return payment;
    }));
  };

  const openPaymentDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage platform transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Transactions
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{paymentStats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
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
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{paymentStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
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
              <div className="text-center">
                <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{paymentStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
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
              <div className="text-center">
                <RefreshCw className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{paymentStats.processing}</p>
                <p className="text-sm text-gray-600">Processing</p>
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
              <div className="text-center">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{paymentStats.failed}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <AlertTriangle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{paymentStats.disputed}</p>
                <p className="text-sm text-gray-600">Disputed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-bold">{formatCurrency(paymentStats.totalVolume)}</p>
                <p className="text-sm text-gray-600">Volume</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-lg font-bold">{formatCurrency(paymentStats.totalFees)}</p>
                <p className="text-sm text-gray-600">Fees</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{paymentStats.flagged}</p>
                <p className="text-sm text-gray-600">Flagged</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by transaction ID, user, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="campaign_payment">Campaign Payment</SelectItem>
                <SelectItem value="platform_fee">Platform Fee</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredPayments.length})</CardTitle>
            <CardDescription>Monitor and manage platform transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.transactionId}</p>
                        <p className="text-sm text-gray-600">{formatTime(payment.createdAt)}</p>
                        {payment.campaign && (
                          <p className="text-xs text-blue-600">{payment.campaign.title}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(payment.type)}>
                        {payment.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {payment.from.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{payment.from.name}</p>
                          <p className="text-xs text-gray-600">{payment.from.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {payment.to.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{payment.to.name}</p>
                          <p className="text-xs text-gray-600">{payment.to.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        {payment.platformFee > 0 && (
                          <p className="text-xs text-gray-600">Fee: {formatCurrency(payment.platformFee)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="text-sm capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {payment.flags.suspicious && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            Suspicious
                          </Badge>
                        )}
                        {payment.flags.highValue && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            High Value
                          </Badge>
                        )}
                        {!payment.flags.suspicious && !payment.flags.highValue && (
                          <Badge variant="outline" className="text-xs">
                            Clean
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPaymentDialog(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={(action) => handlePaymentAction(payment.id, action)}>
                          <SelectTrigger className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </SelectTrigger>
                          <SelectContent>
                            {payment.status === 'pending' && (
                              <>
                                <SelectItem value="approve">Approve</SelectItem>
                                <SelectItem value="reject">Reject</SelectItem>
                              </>
                            )}
                            {payment.status === 'failed' && (
                              <SelectItem value="retry">Retry</SelectItem>
                            )}
                            {payment.status === 'completed' && payment.type === 'campaign_payment' && (
                              <SelectItem value="refund">Refund</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Details Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <div>
                    <h2 className="text-xl font-bold">{selectedPayment.transactionId}</h2>
                    <p className="text-gray-600">{selectedPayment.description}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList>
                  <TabsTrigger value="details">Transaction Details</TabsTrigger>
                  <TabsTrigger value="parties">Parties</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="flags">Flags & Risk</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Type:</span>
                          <Badge className={getTypeColor(selectedPayment.type)}>
                            {selectedPayment.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Status:</span>
                          <Badge className={getStatusColor(selectedPayment.status)}>
                            {selectedPayment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Amount:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedPayment.amount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Platform Fee:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedPayment.platformFee)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Net Amount:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedPayment.netAmount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                          <span className="text-sm">Method:</span>
                          <span className="text-sm font-medium capitalize">{selectedPayment.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Created:</span>
                          <span className="text-sm font-medium">{formatDate(selectedPayment.createdAt)}</span>
                        </div>
                        {selectedPayment.processedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Processed:</span>
                            <span className="text-sm font-medium">{formatDate(selectedPayment.processedAt)}</span>
                          </div>
                        )}
                        {selectedPayment.campaign && (
                          <div>
                            <p className="text-sm font-medium mb-1">Related Campaign:</p>
                            <Badge variant="outline">
                              {selectedPayment.campaign.title}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="parties" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>From</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                            {selectedPayment.from.name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{selectedPayment.from.name}</p>
                            <p className="text-sm text-gray-600">{selectedPayment.from.email}</p>
                            <Badge variant="outline" className="text-xs capitalize">
                              {selectedPayment.from.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>To</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-semibold">
                            {selectedPayment.to.name[0]}
                          </div>
                          <div>
                            <p className="font-medium">{selectedPayment.to.name}</p>
                            <p className="text-sm text-gray-600">{selectedPayment.to.email}</p>
                            <Badge variant="outline" className="text-xs capitalize">
                              {selectedPayment.to.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gateway Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Gateway:</span>
                        <span className="text-sm font-medium">{selectedPayment.metadata.gateway}</span>
                      </div>
                      {selectedPayment.metadata.gatewayTransactionId && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Gateway Transaction ID:</span>
                          <span className="text-sm font-medium font-mono">{selectedPayment.metadata.gatewayTransactionId}</span>
                        </div>
                      )}
                      {selectedPayment.metadata.failureReason && (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Failure Reason:</span>
                          <span className="text-sm font-medium text-red-600">{selectedPayment.metadata.failureReason}</span>
                        </div>
                      )}
                      {selectedPayment.metadata.disputeReason && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">Dispute Reason:</span>
                          <span className="text-sm font-medium text-orange-600">{selectedPayment.metadata.disputeReason}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="flags" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${selectedPayment.flags.suspicious ? 'text-red-500' : 'text-gray-400'}`} />
                            <span className="text-sm">Suspicious Activity</span>
                          </div>
                          <Badge className={selectedPayment.flags.suspicious ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {selectedPayment.flags.suspicious ? 'Flagged' : 'Clean'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className={`w-4 h-4 ${selectedPayment.flags.highValue ? 'text-orange-500' : 'text-gray-400'}`} />
                            <span className="text-sm">High Value Transaction</span>
                          </div>
                          <Badge className={selectedPayment.flags.highValue ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                            {selectedPayment.flags.highValue ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className={`w-4 h-4 ${selectedPayment.flags.frequentUser ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className="text-sm">Frequent User</span>
                          </div>
                          <Badge className={selectedPayment.flags.frequentUser ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {selectedPayment.flags.frequentUser ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}