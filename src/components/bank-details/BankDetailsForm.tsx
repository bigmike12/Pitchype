'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus,
  Building,
  User
} from 'lucide-react'
import { useBankDetails } from '@/hooks/useBankDetails'

interface BankDetail {
  id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
  country: string;
  currency: string;
  is_primary: boolean;
  is_verified: boolean;
  account_name: string;
  bank_code: string;
  created_at: string;
  updated_at: string;
}

interface BankDetailsFormProps {
  bankDetails: BankDetail[];
  onSubmit: (data: Omit<BankDetail, 'id'>) => Promise<void>;
  updateBankDetails: (id: string, data: Partial<BankDetail>) => Promise<void>;
  deleteBankDetails: (id: string) => Promise<void>;
  isLoading?: boolean;
}

interface BankFormData {
  account_holder_name: string
  bank_name: string
  bank_code: string
  account_number: string
  routing_number: string
  account_type: 'checking' | 'savings'
  country: string
  currency: string
  is_primary: boolean
}

interface PaystackBank {
  id: number
  name: string
  slug: string
  code: string
  longcode: string
  gateway: string
  pay_with_bank: boolean
  active: boolean
  country: string
  currency: string
  type: string
  is_deleted: boolean
  createdAt: string
  updatedAt: string
}

const countries = [
  { code: 'NG', name: 'Nigeria', currency: 'NGR' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'KR', name: 'South Korea', currency: 'KRW' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'MX', name: 'Mexico', currency: 'MXN' }
]

export default function BankDetailsForm({
  bankDetails = [],
  onSubmit,
  updateBankDetails,
  deleteBankDetails
}: BankDetailsFormProps) {
  const {
    banks,
    isLoading: loadingBanks,
    fetchBanks,
    submitBankDetails,
    updateBankDetails: updateBankDetailsHook,
    deleteBankDetails: deleteBankDetailsHook,
  } = useBankDetails()
  
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<BankFormData>({
    account_holder_name: '',
    bank_name: '',
    bank_code: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking',
    country: 'NG',
    currency: 'NGR',
    is_primary: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({})



  useEffect(() => {
    if (bankDetails.length === 0) {
      setFormData(prev => ({ ...prev, is_primary: true }))
    }
    
    // Fetch banks on component mount
    fetchBanks()
  }, [bankDetails.length, fetchBanks])

  const handleInputChange = (field: keyof BankFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setFormData(prev => ({
        ...prev,
        country: countryCode,
        currency: country.currency
      }))
    }
  }

  const handleBankChange = (bankCode: string) => {
    const selectedBank = banks.find(bank => bank.code === bankCode)
    if (selectedBank) {
      setFormData(prev => ({
        ...prev,
        bank_name: selectedBank.name,
        bank_code: selectedBank.code,
        routing_number: selectedBank.code // Auto-fill routing number with bank code
      }))
    }
  }

  const validateForm = () => {
    if (!formData.account_holder_name.trim()) {
      setError('Account holder name is required')
      return false
    }
    
    if (!formData.bank_name.trim()) {
      setError('Bank name is required')
      return false
    }
    
    if (!formData.account_number.trim()) {
      setError('Account number is required')
      return false
    }
    
    if (!formData.routing_number.trim()) {
      setError('Routing number is required')
      return false
    }
    
    // Basic validation for US routing numbers
    if (formData.country === 'US' && !/^\d{9}$/.test(formData.routing_number)) {
      setError('US routing numbers must be exactly 9 digits')
      return false
    }
    
    return true
  }

  const resetForm = () => {
    setFormData({
      account_holder_name: '',
      bank_name: '',
      bank_code: '',
      account_number: '',
      routing_number: '',
      account_type: 'checking',
      country: 'NG',
      currency: 'NGR',
      is_primary: bankDetails.length === 0
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    setError('')
    
    try {
      // Map account_holder_name to account_name for API compatibility
      const bankDetailsData = {
        ...formData,
        account_name: formData.account_holder_name
      }
      
      if (editingId) {
        // For updates, we need to provide all required fields
        const fullUpdateData = {
          account_holder_name: formData.account_holder_name,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          routing_number: formData.routing_number,
          account_type: formData.account_type as 'checking' | 'savings',
          country: formData.country,
          currency: formData.currency,
          is_primary: formData.is_primary,
          is_verified: false, // Reset verification on update
          account_name: formData.account_holder_name, // Map for API compatibility
          bank_code: formData.bank_code,
          updated_at: new Date().toISOString()
        };
        await updateBankDetailsHook(editingId, fullUpdateData)
      } else {
        await submitBankDetails(bankDetailsData)
      }
      
      setSuccess(editingId ? 'Bank details updated successfully!' : 'Bank details added successfully!')
      
      if (onSubmit) {
        const bankDetailData = {
          ...formData,
          account_name: formData.account_holder_name,
          bank_code: formData.bank_code,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        onSubmit(bankDetailData)
      }
      
      resetForm()
      
    } catch (error) {
      console.error('Error saving bank details:', error)
      setError(error instanceof Error ? error.message : 'Failed to save bank details')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (bankDetail: BankDetail) => {
    setFormData({
      account_holder_name: bankDetail.account_holder_name,
      bank_name: bankDetail.bank_name,
      bank_code: bankDetail.routing_number || '', // Use routing_number as bank_code for existing records
      account_number: bankDetail.account_number,
      routing_number: bankDetail.routing_number,
      account_type: bankDetail.account_type,
      country: bankDetail.country,
      currency: bankDetail.currency,
      is_primary: bankDetail.is_primary
    })
    setEditingId(bankDetail.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return
    
    try {
      await deleteBankDetailsHook(id)
      setSuccess('Bank details deleted successfully!')
      
      // Bank details deleted successfully via hook
      
    } catch (error) {
      console.error('Error deleting bank details:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete bank details')
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      // Get the current bank details to update
        const currentBankDetail = bankDetails.find(bd => bd.id === id);
        if (currentBankDetail) {
          await updateBankDetailsHook(id, {
             account_name: currentBankDetail.account_name,
             bank_name: currentBankDetail.bank_name,
             account_number: currentBankDetail.account_number,
             bank_code: currentBankDetail.bank_code
           });
        }
      setSuccess('Primary account updated successfully!');
            
    } catch (error) {
      console.error('Error setting primary account:', error);
      setError(error instanceof Error ? error.message : 'Failed to set primary account');
    }
  }

  const toggleAccountNumberVisibility = (id: string) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4)
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {/* Existing Bank Details */}
      {bankDetails.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Bank Accounts</h3>
          <div className="space-y-4">
            {bankDetails.map((bankDetail) => (
              <Card key={bankDetail.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{bankDetail.bank_name}</span>
                        {bankDetail.is_primary && (
                          <Badge className="bg-blue-100 text-blue-800">Primary</Badge>
                        )}
                        {bankDetail.is_verified && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{bankDetail.account_holder_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="h-4 w-4" />
                        <span>
                          {showAccountNumbers[bankDetail.id] 
                            ? bankDetail.account_number 
                            : maskAccountNumber(bankDetail.account_number)
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAccountNumberVisibility(bankDetail.id)}
                        >
                          {showAccountNumbers[bankDetail.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{bankDetail.account_type.charAt(0).toUpperCase() + bankDetail.account_type.slice(1)}</span>
                        <span>{bankDetail.country} • {bankDetail.currency}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!bankDetail.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(bankDetail.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(bankDetail)}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(bankDetail.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Add/Edit Form */}
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {editingId ? 'Edit Bank Account' : 'Add Bank Account'}
            </CardTitle>
            <CardDescription>
              {editingId 
                ? 'Update your bank account information'
                : 'Add a bank account for receiving payouts'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Holder Name */}
              <div>
                <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                <Input
                  id="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                  placeholder="Full name as it appears on the account"
                />
              </div>
              
              {/* Bank Name */}
              <div>
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Select
                  value={formData.bank_code}
                  onValueChange={handleBankChange}
                  disabled={loadingBanks}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBanks ? "Loading banks..." : "Select your bank"} />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Bank Code (Auto-filled, Read-only) */}
              {formData.bank_code && (
                <div>
                  <Label htmlFor="bank_code">Bank Code</Label>
                  <Input
                    id="bank_code"
                    value={formData.bank_code}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Auto-filled from selected bank"
                  />
                </div>
              )}
              
              {/* Country */}
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Account Type */}
              <div>
                <Label htmlFor="account_type">Account Type *</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value: 'checking' | 'savings') => handleInputChange('account_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Account Number */}
              <div>
                <Label htmlFor="account_number">Account Number *</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  placeholder="Your account number"
                  type="text"
                />
              </div>
              
              {/* Routing Number */}
              <div>
                <Label htmlFor="routing_number">
                  {formData.country === 'NG' ? 'Bank Code' : 'Routing Number'} *
                </Label>
                <Input
                  id="routing_number"
                  value={formData.routing_number}
                  readOnly={formData.country === 'NG'}
                  onChange={(e) => handleInputChange('routing_number', e.target.value)}
                  className={formData.country === 'NG' ? 'bg-gray-50' : ''}
                  placeholder={formData.country === 'NG' ? 'Auto-filled from selected bank' : '9-digit routing number'}
                />
              </div>
              
              {/* Primary Account */}
              {(bankDetails.length === 0 || editingId) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_primary"
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => handleInputChange('is_primary', checked)}
                  />
                  <Label htmlFor="is_primary">Set as primary account</Label>
                </div>
              )}
              
              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting 
                    ? (editingId ? 'Updating...' : 'Adding...') 
                    : (editingId ? 'Update Account' : 'Add Account')
                  }
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your bank details are encrypted and stored securely. We never store your full account number in plain text.
        </AlertDescription>
      </Alert>
    </div>
  )
}