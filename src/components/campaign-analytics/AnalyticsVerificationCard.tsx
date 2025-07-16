'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Eye, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare,
  Calendar,
  User,
  BarChart3
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AnalyticsData {
  id: string
  platform: string
  post_url: string
  post_type: string
  views_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  saves_count: number
  reach_count: number
  impressions_count: number
  engagement_rate: number
  click_through_rate: number
  screenshot_urls: string[]
  additional_notes: string
  submitted_at: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'disputed'
  verified_by: string | null
  verified_at: string | null
  verification_notes: string | null
  influencer?: {
    first_name: string
    last_name: string
    avatar_url: string
  }
  campaign?: {
    title: string
  }
}

interface AnalyticsVerificationCardProps {
  analytics: AnalyticsData
  canVerify?: boolean
  onVerify?: (id: string, status: 'verified' | 'rejected', notes: string) => void
  onDispute?: (id: string) => void
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertTriangle,
    label: 'Pending Review'
  },
  verified: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    label: 'Verified'
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    label: 'Rejected'
  },
  disputed: {
    color: 'bg-orange-100 text-orange-800',
    icon: MessageSquare,
    label: 'Disputed'
  }
}

const platformConfig = {
  instagram: { color: 'bg-pink-100 text-pink-800', label: 'Instagram' },
  youtube: { color: 'bg-red-100 text-red-800', label: 'YouTube' },
  tiktok: { color: 'bg-black text-white', label: 'TikTok' },
  twitter: { color: 'bg-blue-100 text-blue-800', label: 'Twitter' }
}

export default function AnalyticsVerificationCard({
  analytics,
  canVerify = false,
  onVerify,
  onDispute
}: AnalyticsVerificationCardProps) {
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showScreenshots, setShowScreenshots] = useState(false)

  const statusInfo = statusConfig[analytics.verification_status]
  const platformInfo = platformConfig[analytics.platform as keyof typeof platformConfig]
  const StatusIcon = statusInfo.icon

  const handleVerification = async (status: 'verified' | 'rejected') => {
    if (!onVerify) return
    
    setSubmitting(true)
    try {
      await onVerify(analytics.id, status, verificationNotes)
      setShowVerificationForm(false)
      setVerificationNotes('')
    } catch (error) {
      console.error('Error verifying analytics:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const calculateEngagement = () => {
    const totalEngagement = analytics.likes_count + analytics.comments_count + analytics.shares_count + analytics.saves_count
    const reach = analytics.reach_count || analytics.impressions_count
    if (reach > 0) {
      return ((totalEngagement / reach) * 100).toFixed(2)
    }
    return analytics.engagement_rate?.toFixed(2) || '0.00'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={platformInfo.color}>
                {platformInfo.label}
              </Badge>
              <Badge variant="outline">
                {analytics.post_type.charAt(0).toUpperCase() + analytics.post_type.slice(1)}
              </Badge>
              <Badge className={statusInfo.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            
            {analytics.campaign && (
              <CardTitle className="text-lg">{analytics.campaign.title}</CardTitle>
            )}
            
            {analytics.influencer && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>
                  {analytics.influencer.first_name} {analytics.influencer.last_name}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Submitted {formatDistanceToNow(new Date(analytics.submitted_at), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(analytics.post_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Post
            </Button>
            
            {analytics.screenshot_urls.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScreenshots(!showScreenshots)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Screenshots ({analytics.screenshot_urls.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Analytics Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4" />
            <h4 className="font-medium">Performance Metrics</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(analytics.views_count)}</div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatNumber(analytics.likes_count)}</div>
              <div className="text-sm text-gray-600">Likes</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatNumber(analytics.comments_count)}</div>
              <div className="text-sm text-gray-600">Comments</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{calculateEngagement()}%</div>
              <div className="text-sm text-gray-600">Engagement</div>
            </div>
            
            {analytics.shares_count > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{formatNumber(analytics.shares_count)}</div>
                <div className="text-sm text-gray-600">Shares</div>
              </div>
            )}
            
            {analytics.saves_count > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{formatNumber(analytics.saves_count)}</div>
                <div className="text-sm text-gray-600">Saves</div>
              </div>
            )}
            
            {analytics.reach_count > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{formatNumber(analytics.reach_count)}</div>
                <div className="text-sm text-gray-600">Reach</div>
              </div>
            )}
            
            {analytics.impressions_count > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">{formatNumber(analytics.impressions_count)}</div>
                <div className="text-sm text-gray-600">Impressions</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Screenshots */}
        {showScreenshots && analytics.screenshot_urls.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Screenshots</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {analytics.screenshot_urls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Analytics screenshot ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional Notes */}
        {analytics.additional_notes && (
          <div>
            <h4 className="font-medium mb-2">Additional Notes</h4>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{analytics.additional_notes}</p>
          </div>
        )}
        
        {/* Verification Status */}
        {analytics.verification_status !== 'pending' && analytics.verification_notes && (
          <div>
            <h4 className="font-medium mb-2">Verification Notes</h4>
            <Alert>
              <StatusIcon className="h-4 w-4" />
              <AlertDescription>{analytics.verification_notes}</AlertDescription>
            </Alert>
            {analytics.verified_at && (
              <p className="text-sm text-gray-500 mt-2">
                Verified {formatDistanceToNow(new Date(analytics.verified_at), { addSuffix: true })}
              </p>
            )}
          </div>
        )}
        
        {/* Verification Actions */}
        {canVerify && analytics.verification_status === 'pending' && (
          <div className="border-t pt-4">
            {!showVerificationForm ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowVerificationForm(true)}
                  className="flex-1"
                >
                  Review Analytics
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="verification-notes">Verification Notes</Label>
                  <Textarea
                    id="verification-notes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about the verification..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVerification('verified')}
                    disabled={submitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {submitting ? 'Verifying...' : 'Approve'}
                  </Button>
                  
                  <Button
                    onClick={() => handleVerification('rejected')}
                    disabled={submitting}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {submitting ? 'Rejecting...' : 'Reject'}
                  </Button>
                  
                  <Button
                    onClick={() => setShowVerificationForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Dispute Option */}
        {analytics.verification_status === 'rejected' && onDispute && (
          <div className="border-t pt-4">
            <Button
              onClick={() => onDispute(analytics.id)}
              variant="outline"
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Dispute Verification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}