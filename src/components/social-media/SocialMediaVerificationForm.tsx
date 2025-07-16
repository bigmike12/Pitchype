'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Instagram, 
  Youtube, 
  Twitter,
  Upload,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface SocialMediaVerificationFormProps {
  onVerificationSubmitted?: () => void
}

interface VerificationRequest {
  id: string
  platform: string
  username: string
  verification_method: 'post' | 'bio'
  verification_key: string
  status: 'pending' | 'verified' | 'rejected'
  verification_proof_url?: string
  admin_notes?: string
  created_at: string
}

export default function SocialMediaVerificationForm({ onVerificationSubmitted }: SocialMediaVerificationFormProps) {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [platform, setPlatform] = useState('')
  const [username, setUsername] = useState('')
  const [verificationMethod, setVerificationMethod] = useState<'post' | 'bio'>('post')
  const [verificationKey, setVerificationKey] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingVerifications, setExistingVerifications] = useState<VerificationRequest[]>([])
  const [loadingVerifications, setLoadingVerifications] = useState(true)
  
  useEffect(() => {
    if (user) {
      fetchExistingVerifications()
    }
  }, [user])

  const fetchExistingVerifications = async () => {
    try {
      setLoadingVerifications(true)
      const { data, error } = await supabase
        .from('social_media_verifications')
        .select('*')
        .eq('influencer_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setExistingVerifications(data || [])
    } catch (error) {
      console.error('Error fetching verifications:', error)
      toast.error('Failed to load existing verifications')
    } finally {
      setLoadingVerifications(false)
    }
  }
  
  const generateVerificationKey = async () => {
    try {
      setLoading(true)
      
      // Check if user already has a pending verification for this platform
      const existingPending = existingVerifications.find(
        v => v.platform === platform && v.status === 'pending'
      )
      
      if (existingPending) {
        setVerificationKey(existingPending.verification_key)
        toast.info('Using existing verification key for this platform')
        return
      }
      
      // Generate profile URL based on platform and username
      const getProfileUrl = (platform: string, username: string) => {
        switch (platform) {
          case 'instagram': return `https://instagram.com/${username}`
          case 'youtube': return `https://youtube.com/@${username}`
          case 'twitter': return `https://twitter.com/${username}`
          case 'tiktok': return `https://tiktok.com/@${username}`
          default: return `https://${platform}.com/${username}`
        }
      }

      // Generate new verification key by creating a new record
      const { data, error } = await supabase
        .from('social_media_verifications')
        .insert({
          influencer_id: user?.id,
          platform,
          username,
          profile_url: getProfileUrl(platform, username),
          verification_method: verificationMethod,
          status: 'pending'
        })
        .select('verification_key')
        .single()
      
      if (error) throw error
      
      setVerificationKey(data.verification_key)
      await fetchExistingVerifications()
      toast.success('Verification key generated! Follow the instructions below.')
    } catch (error) {
      console.error('Error generating verification key:', error)
      toast.error('Failed to generate verification key')
    } finally {
      setLoading(false)
    }
  }
  
  const submitProof = async () => {
    if (!verificationKey || !proofUrl) {
      toast.error('Please provide the screenshot URL')
      return
    }
    
    try {
      setLoading(true)
      
      // Find the pending verification record
      const pendingVerification = existingVerifications.find(
        v => v.platform === platform && v.verification_key === verificationKey && v.status === 'pending'
      )
      
      if (!pendingVerification) {
        toast.error('No pending verification found for this key')
        return
      }
      
      // Update the verification with proof
      const { error } = await supabase
        .from('social_media_verifications')
        .update({
          verification_proof_url: proofUrl,
          verification_submitted_at: new Date().toISOString()
        })
        .eq('id', pendingVerification.id)
      
      if (error) throw error
      
      await fetchExistingVerifications()
      toast.success('Verification proof submitted! We\'ll review it shortly.')
      
      // Reset form
      setPlatform('')
      setUsername('')
      setVerificationKey('')
      setProofUrl('')
      
      onVerificationSubmitted?.()
    } catch (error) {
      console.error('Error submitting proof:', error)
      toast.error('Failed to submit verification proof')
    } finally {
      setLoading(false)
    }
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'youtube': return <Youtube className="h-4 w-4" />
      case 'twitter': return <Twitter className="h-4 w-4" />
      default: return null
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'verified':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing Verifications */}
      {!loadingVerifications && existingVerifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Verification Requests</CardTitle>
            <CardDescription>
              Track the status of your social media verification requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingVerifications.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(verification.platform)}
                    <div>
                      <p className="font-medium">
                        {verification.platform.charAt(0).toUpperCase() + verification.platform.slice(1)} - @{verification.username}
                      </p>
                      <p className="text-sm text-gray-600">
                        {verification.verification_method === 'post' ? 'Post Caption' : 'Bio'} • Key: {verification.verification_key}
                      </p>
                      {verification.admin_notes && (
                        <p className="text-sm text-red-600 mt-1">{verification.admin_notes}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(verification.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* New Verification Form */}
      <Card>
        <CardHeader>
          <CardTitle>Verify Social Media Account</CardTitle>
          <CardDescription>
            Verify your social media account by posting a unique key or adding it to your bio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </div>
                </SelectItem>
                <SelectItem value="youtube">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </div>
                </SelectItem>
                <SelectItem value="twitter">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </div>
                </SelectItem>
                <SelectItem value="tiktok">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">TT</span>
                    TikTok
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username (without @)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          {/* Verification Method */}
          <div className="space-y-3">
            <Label>Verification Method</Label>
            <RadioGroup value={verificationMethod} onValueChange={value => setVerificationMethod(value as 'post' | 'bio')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="post" id="post" />
                <Label htmlFor="post">Post Caption - Add the key to a post caption and screenshot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bio" id="bio" />
                <Label htmlFor="bio">Bio - Add the key to your bio and screenshot</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Generate Key Button */}
          {!verificationKey && (
            <Button 
              onClick={generateVerificationKey} 
              disabled={!platform || !username || loading}
              className="w-full"
            >
              {loading ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : (
                'Generate Verification Key'
              )}
            </Button>
          )}
          
          {/* Verification Key Display */}
          {verificationKey && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Your verification key:</p>
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <code className="text-lg font-bold text-blue-600">{verificationKey}</code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(verificationKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm space-y-2">
                    <p><strong>Instructions:</strong></p>
                    {verificationMethod === 'post' ? (
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Create a new post on {platform}</li>
                        <li>Include the key <code className="bg-gray-200 px-1 rounded">{verificationKey}</code> in your caption</li>
                        <li>Take a screenshot showing the post with the key</li>
                        <li>Upload the screenshot and submit below</li>
                        <li>You can delete the post after verification</li>
                      </ol>
                    ) : (
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Add the key <code className="bg-gray-200 px-1 rounded">{verificationKey}</code> to your {platform} bio</li>
                        <li>Take a screenshot showing your profile with the key in bio</li>
                        <li>Upload the screenshot and submit below</li>
                        <li>You can remove the key from your bio after verification</li>
                      </ol>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Proof Submission */}
          {verificationKey && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proof">Screenshot URL</Label>
                <Input
                  id="proof"
                  placeholder="Paste the URL of your screenshot (e.g., from Imgur, Google Drive, etc.)"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Upload your screenshot to a service like Imgur, Google Drive, or Dropbox and paste the public link here.
                </p>
              </div>
              
              <Button 
                onClick={submitProof} 
                disabled={!proofUrl || loading}
                className="w-full"
              >
                {loading ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Submit Verification Proof</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}