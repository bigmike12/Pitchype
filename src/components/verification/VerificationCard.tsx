'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Users, 
  Calendar,
  FileText,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface VerificationCardProps {
  verification: {
    id: string
    platform: string
    username: string
    profile_url: string
    follower_count: number
    verification_documents?: string[]
    additional_notes?: string
    status: 'pending' | 'verified' | 'rejected'
    admin_notes?: string
    created_at: string
    verified_at?: string
    expires_at?: string
    influencer_profiles?: {
        first_name: string
      last_name: string
      avatar_url?: string
      bio?: string
      specialties?: string[]
    }
  }
  onStatusChange?: (id: string, status: 'verified' | 'rejected', notes: string) => void
}

export default function VerificationCard({ verification, onStatusChange }: VerificationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [adminNotes, setAdminNotes] = useState(verification.admin_notes || '')
  const [showDocuments, setShowDocuments] = useState(false)
  
  const handleStatusChange = async (status: 'verified' | 'rejected') => {
    if (!onStatusChange) return
    
    if (!adminNotes.trim() && status === 'rejected') {
      toast.error('Please provide notes when rejecting a verification request')
      return
    }
    
    setIsProcessing(true)
    
    try {
      await onStatusChange(verification.id, status, adminNotes)
      toast.success(`Verification ${status} successfully`)
    } catch (error) {
      toast.error(`Failed to ${status} verification`)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const getStatusBadge = () => {
    switch (verification.status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }
  
  const getPlatformBadge = () => {
    const platformConfig = {
      instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-800' },
      youtube: { label: 'YouTube', color: 'bg-red-100 text-red-800' },
      tiktok: { label: 'TikTok', color: 'bg-black text-white' },
      twitter: { label: 'Twitter', color: 'bg-blue-100 text-blue-800' }
    }
    
    const config = platformConfig[verification.platform as keyof typeof platformConfig] || 
      { label: verification.platform, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }
  
  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }
  
  const isExpiringSoon = () => {
    if (!verification.expires_at || verification.status !== 'verified') return false
    const expiryDate = new Date(verification.expires_at)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={verification.influencer_profiles?.avatar_url} />
              <AvatarFallback>
                {verification.influencer_profiles?.first_name?.[0]}{verification.influencer_profiles?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {verification.influencer_profiles?.first_name} {verification.influencer_profiles?.last_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getPlatformBadge()}
                <span className="text-sm text-gray-600">@{verification.username}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {isExpiringSoon() && (
              <Badge className="bg-orange-100 text-orange-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Expiring Soon
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Followers:</span>
              <span className="text-sm text-gray-600">
                {formatFollowerCount(verification.follower_count)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Profile URL:</span>
              <a 
                href={verification.profile_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate"
              >
                {verification.profile_url}
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Submitted:</span>
              <span className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(verification.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {verification.verified_at && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Verified:</span>
                <span className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(verification.verified_at), { addSuffix: true })}
                </span>
              </div>
            )}
            
            {verification.expires_at && verification.status === 'verified' && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Expires:</span>
                <span className={`text-sm ${isExpiringSoon() ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                  {formatDistanceToNow(new Date(verification.expires_at), { addSuffix: true })}
                </span>
              </div>
            )}
            
            {verification.influencer_profiles?.specialties && (
              <div>
                <span className="text-sm font-medium">Specialties:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {verification.influencer_profiles.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {verification.influencer_profiles.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{verification.influencer_profiles.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Notes */}
        {verification.additional_notes && (
          <div>
            <h4 className="text-sm font-medium mb-2">Influencer Notes:</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {verification.additional_notes}
            </p>
          </div>
        )}
        
        {/* Bio */}
        {verification.influencer_profiles?.bio && (
          <div>
            <h4 className="text-sm font-medium mb-2">Bio:</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {verification.influencer_profiles.bio}
            </p>
          </div>
        )}
        
        {/* Verification Documents */}
        {verification.verification_documents && verification.verification_documents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Verification Documents:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDocuments(!showDocuments)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showDocuments ? 'Hide' : 'View'} Documents
              </Button>
            </div>
            
            {showDocuments && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verification.verification_documents.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Document {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        View
                      </Button>
                    </div>
                    {doc.match(/\.(jpg|jpeg|png|gif)$/i) && (
                      <img 
                        src={doc} 
                        alt={`Verification document ${index + 1}`}
                        className="w-full h-32 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Admin Notes */}
        {verification.admin_notes && (
          <div>
            <h4 className="text-sm font-medium mb-2">Admin Notes:</h4>
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              {verification.admin_notes}
            </p>
          </div>
        )}
        
        {/* Admin Actions */}
        {verification.status === 'pending' && onStatusChange && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium mb-3">Admin Review:</h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Admin Notes:
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this verification request..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleStatusChange('verified')}
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
                
                <Button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions for Verified Accounts */}
        {verification.status === 'verified' && onStatusChange && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-green-700">Verified Account</h4>
                <p className="text-xs text-gray-600">
                  This account has been verified and can display the verified badge
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(verification.profile_url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}