'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCampaignAnalyticsSubmission } from '@/hooks/useCampaignAnalyticsSubmission'

interface AnalyticsSubmissionFormProps {
  applicationId: string
  campaignId: string
  onSubmit?: (data: any) => void
  onCancel?: () => void
}

const platforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'Twitter' }
]

const postTypes = {
  instagram: ['post', 'story', 'reel'],
  youtube: ['video', 'short'],
  tiktok: ['video'],
  twitter: ['tweet', 'thread']
}

export default function AnalyticsSubmissionForm({
  applicationId,
  campaignId,
  onSubmit,
  onCancel
}: AnalyticsSubmissionFormProps) {
  const { uploadFile, submitAnalytics, isSubmitting, isUploading } = useCampaignAnalyticsSubmission();
  
  const [formData, setFormData] = useState({
    platform: '',
    post_url: '',
    post_type: '',
    views_count: '',
    likes_count: '',
    comments_count: '',
    shares_count: '',
    saves_count: '',
    reach_count: '',
    impressions_count: '',
    engagement_rate: '',
    click_through_rate: '',
    additional_notes: ''
  })
  
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Reset post type when platform changes
    if (field === 'platform') {
      setFormData(prev => ({ ...prev, post_type: '' }))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isValidType && isValidSize
    })
    
    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Please upload only images under 5MB.')
    }
    
    setScreenshots(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 screenshots
  }

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  const uploadScreenshots = async (): Promise<string[]> => {
    if (screenshots.length === 0) return []
    
    const uploadedUrls: string[] = []
    
    try {
      for (const file of screenshots) {
        const url = await uploadFile(file)
        uploadedUrls.push(url)
      }
    } catch (error) {
      console.error('Error uploading screenshots:', error)
      throw new Error('Failed to upload screenshots')
    }
    
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      // Validate required fields
      if (!formData.platform || !formData.post_url || !formData.post_type) {
        throw new Error('Please fill in all required fields')
      }
      
      // Upload screenshots
      const screenshotUrls = await Promise.all(
        screenshots.map(file => uploadFile(file))
      )
      
      // Prepare submission data
      const submissionData = {
        applicationId: applicationId,
        campaignId: campaignId,
        platform: formData.platform,
        post_type: formData.post_type,
        post_url: formData.post_url,
        metrics: {
          views: parseInt(formData.views_count) || 0,
          likes: parseInt(formData.likes_count) || 0,
          comments: parseInt(formData.comments_count) || 0,
          shares: parseInt(formData.shares_count) || 0,
          clicks: parseInt(formData.saves_count) || 0,
          reach: parseInt(formData.reach_count) || 0,
          impressions: parseInt(formData.impressions_count) || 0,
          engagement_rate: parseFloat(formData.engagement_rate) || 0
        },
        screenshot: screenshots[0],
        additional_notes: formData.additional_notes
      }
      
      // Submit to API
      await submitAnalytics(submissionData)
      
      setSuccess(true)
      
      if (onSubmit) {
        onSubmit(submissionData)
      }
      
      // Reset form
      setFormData({
        platform: '',
        post_url: '',
        post_type: '',
        views_count: '',
        likes_count: '',
        comments_count: '',
        shares_count: '',
        saves_count: '',
        reach_count: '',
        impressions_count: '',
        engagement_rate: '',
        click_through_rate: '',
        additional_notes: ''
      })
      setScreenshots([])
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Submitted Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your campaign analytics have been submitted for verification. You'll be notified once they're reviewed.
            </p>
            <Button onClick={() => setSuccess(false)}>Submit Another</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Campaign Analytics</CardTitle>
        <CardDescription>
          Provide detailed analytics for your campaign post. All submissions will be verified by the business.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(platform => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Post Type */}
          {formData.platform && (
            <div className="space-y-2">
              <Label htmlFor="post_type">Post Type *</Label>
              <Select value={formData.post_type} onValueChange={(value) => handleInputChange('post_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  {postTypes[formData.platform as keyof typeof postTypes]?.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Post URL */}
          <div className="space-y-2">
            <Label htmlFor="post_url">Post URL *</Label>
            <Input
              id="post_url"
              type="url"
              value={formData.post_url}
              onChange={(e) => handleInputChange('post_url', e.target.value)}
              placeholder="https://..."
              required
            />
          </div>
          
          {/* Analytics Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="views_count">Views</Label>
              <Input
                id="views_count"
                type="number"
                value={formData.views_count}
                onChange={(e) => handleInputChange('views_count', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="likes_count">Likes</Label>
              <Input
                id="likes_count"
                type="number"
                value={formData.likes_count}
                onChange={(e) => handleInputChange('likes_count', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comments_count">Comments</Label>
              <Input
                id="comments_count"
                type="number"
                value={formData.comments_count}
                onChange={(e) => handleInputChange('comments_count', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shares_count">Shares</Label>
              <Input
                id="shares_count"
                type="number"
                value={formData.shares_count}
                onChange={(e) => handleInputChange('shares_count', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="saves_count">Saves</Label>
              <Input
                id="saves_count"
                type="number"
                value={formData.saves_count}
                onChange={(e) => handleInputChange('saves_count', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reach_count">Reach</Label>
              <Input
                id="reach_count"
                type="number"
                value={formData.reach_count}
                onChange={(e) => handleInputChange('reach_count', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="impressions_count">Impressions</Label>
              <Input
                id="impressions_count"
                type="number"
                value={formData.impressions_count}
                onChange={(e) => handleInputChange('impressions_count', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
              <Input
                id="engagement_rate"
                type="number"
                step="0.01"
                value={formData.engagement_rate}
                onChange={(e) => handleInputChange('engagement_rate', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="click_through_rate">Click-through Rate (%)</Label>
              <Input
                id="click_through_rate"
                type="number"
                step="0.01"
                value={formData.click_through_rate}
                onChange={(e) => handleInputChange('click_through_rate', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Screenshot Upload */}
          <div className="space-y-2">
            <Label>Screenshots (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload screenshots of your analytics (max 5 files, 5MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('screenshot-upload')?.click()}
                >
                  Choose Files
                </Button>
              </div>
              
              {screenshots.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {screenshots.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              placeholder="Any additional information about your campaign performance..."
              rows={3}
            />
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : isUploading ? 'Uploading...' : 'Submit Analytics'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}