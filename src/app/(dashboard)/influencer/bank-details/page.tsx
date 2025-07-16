'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useFinancials } from '@/hooks/useFinancials'
import BankDetailsForm from '@/components/bank-details/BankDetailsForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Shield, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function BankDetailsPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  
  // Use the financials hook
  const {
    bankDetails,
    payoutRequests,
    balance,
    loading: dataLoading,
    error,
    stats,
    refetch
  } = useFinancials({ influencerId: user?.id, limit: 5 })
  
  if (dataLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading bank details...</p>
        </div>
      </div>
    )
  }
  
  if (!user || userProfile?.user_role !== 'influencer') {
    return null
  }
  // Use stats from the hook
  const {
    totalBankAccounts,
    verifiedAccounts,
    primaryAccount,
    availableBalance,
    pendingBalance,
    totalPayoutAmount,
    recentPayouts
  } = stats
  
  const recentPayoutsDisplay = recentPayouts.slice(0, 3)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bank Details & Payouts</h1>
        <p className="text-gray-600">
          Manage your bank accounts and track your earnings
        </p>
      </div>
      
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{availableBalance.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Balance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ₦{pendingBalance.toFixed(2)}
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
                <p className="text-sm font-medium text-gray-600">Bank Accounts</p>
                <p className="text-2xl font-bold text-blue-600">{totalBankAccounts}</p>
                <p className="text-xs text-gray-500">{verifiedAccounts} verified</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₦{totalPayoutAmount.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alerts */}
      {totalBankAccounts === 0 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You haven't added any bank accounts yet. Add a bank account to receive payouts from completed campaigns.
          </AlertDescription>
        </Alert>
      )}
      
      {totalBankAccounts > 0 && verifiedAccounts === 0 && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your bank accounts are pending verification. Verified accounts can receive payouts faster and with lower fees.
          </AlertDescription>
        </Alert>
      )}
      
      {availableBalance > 0 && !primaryAccount && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have available balance but no primary bank account set. Please set a primary account to request payouts.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bank Details Management */}
        <div className="lg:col-span-2">
          <BankDetailsForm 
            bankDetails={bankDetails.map(detail => ({
                ...detail,
                account_name: detail.account_holder_name,
                bank_code: detail.routing_number || ''
              }))}
            onSubmit={async (data) => {
              // Handle new bank details submission
              await refetch();
            }}
            updateBankDetails={async (id, data) => {
              // Handle bank details update
              await refetch();
            }}
            deleteBankDetails={async (id) => {
              // Handle bank details deletion
              await refetch();
            }}
          />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Payouts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayoutsDisplay.length > 0 ? (
                <div className="space-y-3">
                  {recentPayoutsDisplay.map((payout) => {
                    const statusColor = payout.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : payout.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : payout.status === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                    
                    return (
                      <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">₦{payout.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(payout.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge className={statusColor}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </Badge>
                      </div>
                    )
                  })}
                  
                  <div className="pt-3 border-t">
                    <a 
                      href="/influencer/payouts" 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all payouts →
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No payouts yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payout Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Payout Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Payout Schedule</h4>
                <p className="text-sm text-gray-600">
                  Payouts are processed weekly on Fridays for completed campaigns.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Processing Time</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Verified accounts: 1-2 business days</li>
                  <li>• Unverified accounts: 3-5 business days</li>
                  <li>• International transfers: 5-7 business days</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Minimum Payout</h4>
                <p className="text-sm text-gray-600">
                  ₦50.00 minimum balance required to request a payout.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Fees</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Verified accounts: Free</li>
                  <li>• Unverified accounts: ₦2.50 per transfer</li>
        <li>• International transfers: ₦15.00</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security:</strong> Your bank details are encrypted using industry-standard security measures. 
              We never store your full account number in plain text and use secure payment processors for all transactions.
            </AlertDescription>
          </Alert>
          
          {/* Quick Actions */}
          {availableBalance >= 50 && primaryAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="/influencer/payouts/request"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Payout
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Common Questions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• How long does bank verification take?</li>
                <li>• What documents do I need for verification?</li>
                <li>• Can I add multiple bank accounts?</li>
                <li>• How do I change my primary account?</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600 mb-3">
                If you have questions about payouts or bank verification, our support team is here to help.
              </p>
              <a
                href="/support"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}