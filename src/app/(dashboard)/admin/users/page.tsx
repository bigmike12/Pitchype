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
import { Search, Filter, MoreHorizontal, Eye, Edit, Ban, CheckCircle, XCircle, Users, Building2, Star, Calendar, Mail, MapPin, Globe, Instagram, Twitter, Youtube, Video, Download, UserPlus, AlertTriangle } from 'lucide-react';
import { MotionDiv } from '@/components/performance/LazyMotion';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'business' | 'influencer';
  status: 'active' | 'suspended' | 'pending' | 'banned';
  verified: boolean;
  joinDate: string;
  lastActive: string;
  location: string;

  website?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  stats: {
    campaigns: number;
    totalSpent?: number;
    totalEarned?: number;
    followers?: number;
    engagementRate?: number;
    rating: number;
  };
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'StyleCorp',
    email: 'contact@stylecorp.com',
    type: 'business',
    status: 'active',
    verified: true,
    joinDate: '2024-01-15',
    lastActive: '2024-02-01T14:30:00Z',
    location: 'New York, NY',
  
    website: 'https://stylecorp.com',
    stats: {
      campaigns: 25,
      totalSpent: 45000,
      rating: 4.8
    }
  },
  {
    id: '2',
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    type: 'influencer',
    status: 'active',
    verified: true,
    joinDate: '2024-01-20',
    lastActive: '2024-02-01T13:45:00Z',
    location: 'Los Angeles, CA',
    socialMedia: {
      instagram: '@emmawilson',
      youtube: 'EmmWilsonVlogs',
      tiktok: '@emmaw'
    },
    stats: {
      campaigns: 18,
      totalEarned: 28500,
      followers: 125000,
      engagementRate: 8.9,
      rating: 4.9
    }
  },
  {
    id: '3',
    name: 'TechNova',
    email: 'hello@technova.io',
    type: 'business',
    status: 'pending',
    verified: false,
    joinDate: '2024-01-28',
    lastActive: '2024-02-01T12:20:00Z',
    location: 'San Francisco, CA',
    website: 'https://technova.io',
    stats: {
      campaigns: 3,
      totalSpent: 8500,
      rating: 4.2
    }
  },
  {
    id: '4',
    name: 'Alex Johnson',
    email: 'alex.j@email.com',
    type: 'influencer',
    status: 'active',
    verified: true,
    joinDate: '2024-01-25',
    lastActive: '2024-02-01T11:15:00Z',
    location: 'Miami, FL',
    socialMedia: {
      instagram: '@alexjfitness',
      youtube: 'AlexJohnsonFit'
    },
    stats: {
      campaigns: 12,
      totalEarned: 15200,
      followers: 89000,
      engagementRate: 7.2,
      rating: 4.6
    }
  },
  {
    id: '5',
    name: 'FitTech Solutions',
    email: 'info@fittech.com',
    type: 'business',
    status: 'suspended',
    verified: true,
    joinDate: '2024-01-10',
    lastActive: '2024-01-30T10:30:00Z',
    location: 'Austin, TX',
  
    website: 'https://fittech.com',
    stats: {
      campaigns: 8,
      totalSpent: 12000,
      rating: 3.8
    }
  },
  {
    id: '6',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    type: 'influencer',
    status: 'banned',
    verified: false,
    joinDate: '2024-01-22',
    lastActive: '2024-01-29T09:45:00Z',
    location: 'Seattle, WA',
    socialMedia: {
      instagram: '@sarahchenbeauty',
      tiktok: '@sarahc'
    },
    stats: {
      campaigns: 5,
      totalEarned: 3200,
      followers: 45000,
      engagementRate: 5.1,
      rating: 3.2
    }
  }
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || user.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const userStats = {
    total: users.length,
    businesses: users.filter(u => u.type === 'business').length,
    influencers: users.filter(u => u.type === 'influencer').length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    banned: users.filter(u => u.status === 'banned').length
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'suspended': return <XCircle className="w-4 h-4 text-orange-500" />;
      case 'banned': return <Ban className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const handleUserAction = (userId: string, action: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'active' as const };
          case 'suspend':
            return { ...user, status: 'suspended' as const };
          case 'ban':
            return { ...user, status: 'banned' as const };
          case 'verify':
            return { ...user, verified: true };
          case 'unverify':
            return { ...user, verified: false };
          default:
            return user;
        }
      }
      return user;
    }));
  };

  const openUserDialog = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': return <Video className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage platform users and their accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userStats.total}</p>
                <p className="text-sm text-gray-600">Total Users</p>
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
              <div className="text-center">
                <Building2 className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userStats.businesses}</p>
                <p className="text-sm text-gray-600">Businesses</p>
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
              <div className="text-center">
                <Star className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userStats.influencers}</p>
                <p className="text-sm text-gray-600">Influencers</p>
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
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userStats.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <XCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userStats.suspended}</p>
                <p className="text-sm text-gray-600">Suspended</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Ban className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{userStats.banned}</p>
                <p className="text-sm text-gray-600">Banned</p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="User Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage and monitor platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Campaigns</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.type === 'business' ? (
                          <><Building2 className="w-3 h-3 mr-1" /> Business</>
                        ) : (
                          <><Star className="w-3 h-3 mr-1" /> Influencer</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.verified ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{user.stats.campaigns}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.type === 'business' ? (
                          <>
                            <p className="text-sm font-medium">
                              {formatCurrency(user.stats.totalSpent || 0)}
                            </p>
                            <p className="text-xs text-gray-600">Total Spent</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium">
                              {formatNumber(user.stats.followers || 0)} followers
                            </p>
                            <p className="text-xs text-gray-600">
                              {user.stats.engagementRate}% engagement
                            </p>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatTime(user.lastActive)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUserDialog(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={(action) => handleUserAction(user.id, action)}>
                          <SelectTrigger className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </SelectTrigger>
                          <SelectContent>
                            {user.status !== 'active' && (
                              <SelectItem value="activate">Activate</SelectItem>
                            )}
                            {user.status !== 'suspended' && user.status !== 'banned' && (
                              <SelectItem value="suspend">Suspend</SelectItem>
                            )}
                            {user.status !== 'banned' && (
                              <SelectItem value="ban">Ban</SelectItem>
                            )}
                            {!user.verified && (
                              <SelectItem value="verify">Verify</SelectItem>
                            )}
                            {user.verified && (
                              <SelectItem value="unverify">Unverify</SelectItem>
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
      </MotionDiv>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                    {selectedUser.name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Type:</span>
                          <Badge variant="outline" className="capitalize">
                            {selectedUser.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedUser.status)}
                          <span className="text-sm">Status:</span>
                          <Badge className={getStatusColor(selectedUser.status)}>
                            {selectedUser.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Verified:</span>
                          <Badge className={selectedUser.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {selectedUser.verified ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Joined:</span>
                          <span className="text-sm font-medium">{formatDate(selectedUser.joinDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Location:</span>
                          <span className="text-sm font-medium">{selectedUser.location}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Email:</span>
                          <span className="text-sm font-medium">{selectedUser.email}</span>
                        </div>

                        {selectedUser.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">Website:</span>
                            <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                              {selectedUser.website}
                            </a>
                          </div>
                        )}
                        {selectedUser.socialMedia && (
                          <div>
                            <p className="text-sm font-medium mb-2">Social Media:</p>
                            <div className="space-y-2">
                              {Object.entries(selectedUser.socialMedia).map(([platform, handle]) => (
                                handle && (
                                  <div key={platform} className="flex items-center gap-2">
                                    {getSocialIcon(platform)}
                                    <span className="text-sm capitalize">{platform}:</span>
                                    <span className="text-sm font-medium">{handle}</span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{selectedUser.stats.campaigns}</p>
                          <p className="text-sm text-gray-600">Campaigns</p>
                        </div>
                        {selectedUser.type === 'business' ? (
                          <div className="text-center p-4 border rounded-lg">
                            <p className="text-2xl font-bold">{formatCurrency(selectedUser.stats.totalSpent || 0)}</p>
                            <p className="text-sm text-gray-600">Total Spent</p>
                          </div>
                        ) : (
                          <>
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-2xl font-bold">{formatCurrency(selectedUser.stats.totalEarned || 0)}</p>
                              <p className="text-sm text-gray-600">Total Earned</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-2xl font-bold">{formatNumber(selectedUser.stats.followers || 0)}</p>
                              <p className="text-sm text-gray-600">Followers</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-2xl font-bold">{selectedUser.stats.engagementRate}%</p>
                              <p className="text-sm text-gray-600">Engagement Rate</p>
                            </div>
                          </>
                        )}
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{selectedUser.stats.rating}</p>
                          <p className="text-sm text-gray-600">Rating</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2" />
                        <p>Activity tracking would be implemented here</p>
                        <p className="text-sm">Login history, campaign activities, etc.</p>
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