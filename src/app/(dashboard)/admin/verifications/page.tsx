'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Instagram, 
  Youtube, 
  Twitter,
  ExternalLink,
  Calendar,
  Users,
  Eye,
  AlertTriangle,
  User,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useSocialMediaVerifications } from '@/hooks/useSocialMediaVerifications'

const platformConfig = {
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    color: 'bg-pink-100 text-pink-800'
  },
  youtube: {
    icon: Youtube,
    label: 'YouTube',
    color: 'bg-red-100 text-red-800'
  },
  tiktok: {
    icon: Twitter, // Using Twitter icon as placeholder
    label: 'TikTok',
    color: 'bg-black text-white'
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    color: 'bg-blue-100 text-blue-800'
  }
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
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
  }
}

interface VerificationCardProps {
  verification: any
  updateVerificationStatus: (id: string, data: { status: 'verified' | 'rejected'; admin_notes?: string }) => Promise<void>
}

function VerificationCard({ verification, updateVerificationStatus }: VerificationCardProps) {
  const platform = platformConfig[verification.platform as keyof typeof platformConfig]
  const status = statusConfig[verification.verification_status as keyof typeof statusConfig]
  const PlatformIcon = platform.icon
  const StatusIcon = status.icon
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PlatformIcon className="h-5 w-5" />
              <Badge className={platform.color}>
                {platform.label}
              </Badge>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {verification.profiles?.influencer_profiles?.first_name} {verification.profiles?.influencer_profiles?.last_name}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Username:</strong> {verification.username}</p>
              <p><strong>Followers:</strong> {verification.follower_count?.toLocaleString()}</p>
              <p><strong>Submitted:</strong> {formatDistanceToNow(new Date(verification.created_at), { addSuffix: true })}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(verification.profile_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Profile
            </Button>
            
            {verification.verification_documents && verification.verification_documents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Open documents in new tabs
                  verification.verification_documents.forEach((doc: string) => {
                    window.open(doc, '_blank')
                  })
                }}
              >
                <FileText className="h-4 w-4 mr-1" />
                Documents ({verification.verification_documents.length})
              </Button>
            )}
          </div>
        </div>
        
        {verification.additional_notes && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Additional Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {verification.additional_notes}
            </p>
          </div>
        )}
        
        {verification.verification_status === 'pending' && (
          <div className="flex gap-2 pt-4 border-t">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const status = formData.get('status') as string;
                const adminNotes = formData.get('admin_notes') as string;
                
                try {
                  await updateVerificationStatus(verification.id, {
                    status: status as 'verified' | 'rejected',
                    admin_notes: adminNotes || undefined,
                  });
                  toast.success(`Verification ${status}`);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to update verification');
                }
              }}
              className="flex gap-2 w-full"
            >
              <input type="hidden" name="status" value="verified" />
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </form>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const status = formData.get('status') as string;
                const adminNotes = formData.get('admin_notes') as string;
                
                try {
                  await updateVerificationStatus(verification.id, {
                    status: status as 'verified' | 'rejected',
                    admin_notes: adminNotes || undefined,
                  });
                  toast.success(`Verification ${status}`);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to update verification');
                }
              }}
              className="flex gap-2 w-full"
            >
              <input type="hidden" name="status" value="rejected" />
              <Button
                type="submit"
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </form>
          </div>
        )}
        
        {verification.verification_status !== 'pending' && verification.verified_at && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              {verification.verification_status === 'verified' ? 'Approved' : 'Rejected'} {formatDistanceToNow(new Date(verification.verified_at), { addSuffix: true })}
              {verification.verification_notes && (
                <span className="block mt-1 text-gray-600">
                  Note: {verification.verification_notes}
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminVerificationsPage() {
  const {
    verifications,
    isLoading: loading,
    isSubmitting,
    fetchVerifications,
    updateVerificationStatus,
    getVerificationsByStatus,
    getVerificationStats
  } = useSocialMediaVerifications()
  const [session, setSession] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      // Check if user is an admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      
      setSession(session)
      fetchVerifications()
    }
    
    checkAuth()
  }, [])
  

  
  const handleVerification = async (id: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      await updateVerificationStatus(id, { status, admin_notes: notes })
      toast.success(`Verification ${status} successfully`)
    } catch (error) {
      console.error('Error updating verification:', error)
      toast.error(`Failed to ${status} verification`)
      throw error
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading verifications...</p>
        </div>
      </div>
    )
  }
  
  if (!session) {
    return null
  }
  
  // Calculate stats
  const stats = getVerificationStats()
  const totalVerifications = stats.total
  const pendingVerifications = getVerificationsByStatus('pending')
  const verifiedCount = stats.verified
  const rejectedCount = stats.rejected
  
  // Group by platform
  const platformStats = verifications?.reduce((acc, v) => {
    acc[v.platform] = (acc[v.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  // Recent activity (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentActivity = verifications?.filter(v => new Date(v.created_at) > weekAgo).length || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Media Verifications</h1>
        <p className="text-gray-600">
          Review and manage influencer social media verification requests
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingVerifications.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-blue-600">{recentActivity}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Platform Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
          <CardDescription>
            Verification requests by social media platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(platformStats).map(([platform, count]) => {
              const config = platformConfig[platform as keyof typeof platformConfig]
              const Icon = config?.icon || Users
              const countNum = count as number
              
              return (
                <div key={platform} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Icon className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">{config?.label || platform}</p>
                  <p className="text-2xl font-bold text-gray-900">{countNum}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Urgent Alerts */}
      {pendingVerifications.length > 10 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingVerifications.length} pending verification requests. 
            Consider reviewing them to maintain good response times.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review
            {pendingVerifications.length > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                {pendingVerifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <div className="space-y-6">
            {pendingVerifications.length > 0 ? (
              pendingVerifications.map((verification) => (
                <VerificationCard key={verification.id} verification={verification} updateVerificationStatus={updateVerificationStatus} />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-gray-600">
                    No pending verification requests at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="verified">
          <div className="space-y-6">
            {verifications?.filter(v => v.verification_status === 'verified').map((verification) => (
              <VerificationCard key={verification.id} verification={verification} updateVerificationStatus={updateVerificationStatus} />
            )) || (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Verified Accounts
                  </h3>
                  <p className="text-gray-600">
                    No verified social media accounts yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="rejected">
          <div className="space-y-6">
            {verifications?.filter(v => v.verification_status === 'rejected').map((verification) => (
              <VerificationCard key={verification.id} verification={verification} updateVerificationStatus={updateVerificationStatus} />
            )) || (
              <Card>
                <CardContent className="text-center py-12">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Rejected Requests
                  </h3>
                  <p className="text-gray-600">
                    No rejected verification requests.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="space-y-6">
            {verifications && verifications.length > 0 ? (
              verifications.map((verification) => (
                <VerificationCard key={verification.id} verification={verification} updateVerificationStatus={updateVerificationStatus} />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Verification Requests
                  </h3>
                  <p className="text-gray-600">
                    No verification requests have been submitted yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Verification Guidelines</CardTitle>
          <CardDescription>
            Guidelines for reviewing social media verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-700">Approve When:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Profile URL matches the provided username</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Account appears authentic and active</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Follower count seems reasonable and genuine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Supporting documents are clear and valid</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Content quality meets platform standards</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-700">Reject When:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Profile URL doesn't match or is invalid</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Account appears fake or inactive</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Suspicious follower patterns or bot activity</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Inappropriate or harmful content</span>
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Insufficient or invalid documentation</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}