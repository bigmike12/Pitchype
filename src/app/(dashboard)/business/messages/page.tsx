'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { Search, Send, Paperclip, MoreVertical, Phone, Video, Star, CheckCircle, Clock, Image as ImageIcon, File, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useNotifications } from '@/hooks/useNotifications';
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useSendMessage } from '@/hooks/useSendMessage';

// Import the Conversation type from the hook
type Conversation = {
  id: string;
  application_id: string;
  business_id: string;
  influencer_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  business?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
  };
  influencer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  campaign?: {
    id: string;
    title: string;
    status: string;
  };
};

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
}



export default function MessagesPage() {
  const { user } = useAuth();
  const { getMultipleUserPresence: _getMultipleUserPresence } = useUserPresence();
  
  // Memoize getMultipleUserPresence to prevent infinite loops
  const getMultipleUserPresence = useCallback(_getMultipleUserPresence, []);
  const { notifications } = useNotifications();
  
  // Use the new useConversations hook
  const { 
    conversations, 
    loading: conversationsLoading, 
    updateConversationOnlineStatus 
  } = useConversations();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  // Use the useMessages hook for the selected conversation
  const { 
    messages: conversationMessages, 
    loading: messagesLoading 
  } = useMessages({
    applicationId: selectedConversation?.id || '',
    limit: 50
  });
  const [userPresence, setUserPresence] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use the send message hook
  const { sendMessage, sending: sendingMessage } = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  // Update online status for conversations
  const updateConversationsOnlineStatus = async (conversationList: Conversation[]) => {
    if (conversationList.length === 0) return conversationList;
    
    const userIds = conversationList.map(conv => conv.influencer?.id).filter(Boolean) as string[];
    const presenceData = await getMultipleUserPresence(userIds);
    setUserPresence(presenceData);
    
    return conversationList.map(conv => ({
      ...conv,
      influencer: conv.influencer ? {
        ...conv.influencer,
        isOnline: presenceData[conv.influencer.id] || false
      } : undefined
    }));
  };

  // Auto-select first conversation when conversations are loaded
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Messages are now fetched by the useMessages hook

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conversation => {
    const influencerName = ((conversation.influencer?.first_name || '') + ' ' + (conversation.influencer?.last_name || '')).trim();
    return influencerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conversation.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  const handleSendMessage = async () => {
    if (!selectedConversation) return;

    const result = await sendMessage({
      applicationId: selectedConversation.application_id,
      content: newMessage
    });

    if (result) {
      setNewMessage('');
      // The useMessages hook will automatically refetch and update the messages
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark messages as read
    if (conversation.influencer?.id) {
      setUserPresence(prev => ({
        ...prev,
        [conversation.influencer!.id]: true
      }));
    }
  };

  const markAsRead = (conversationId: string) => {
    // TODO: Implement mark as read with API call
  };

  const toggleStar = (conversationId: string) => {
    // TODO: Implement star toggle with API call
    toast.info('Star toggle functionality will be implemented');
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp || timestamp.trim() === '') {
      return '';
    }
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };



  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-2">
            {conversationsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-gray-400">Messages will appear here when influencers contact you</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-colors',
                    selectedConversation?.id === conversation.id
                      ? 'bg-green-50 border border-green-200'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.influencer?.avatar_url || ''} />
                        <AvatarFallback>
                          {((conversation.influencer?.first_name || '') + ' ' + (conversation.influencer?.last_name || '')).trim().split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {userPresence[conversation.influencer?.id || ''] && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {((conversation.influencer?.first_name || '') + ' ' + (conversation.influencer?.last_name || '')).trim() || 'Unknown User'}
                        </h3>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">Influencer</Badge>
                        {(conversation.unread_count || 0) > 0 && (
                          <Badge className="bg-green-600 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      {conversation.campaign && (
                        <p className="text-xs text-blue-600 mb-1 truncate">
                          {conversation.campaign.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {conversation.last_message_at ? formatTime(conversation.last_message_at) : ''}
                        </p>
                        {!userPresence[conversation.influencer?.id || ''] && (
                          <p className="text-xs text-gray-400">
                            Offline
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={selectedConversation.influencer?.avatar_url || ''} />
                      <AvatarFallback>
                        {((selectedConversation.influencer?.first_name || '') + ' ' + (selectedConversation.influencer?.last_name || '')).trim().split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {userPresence[selectedConversation.influencer?.id || ''] && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{((selectedConversation.influencer?.first_name || '') + ' ' + (selectedConversation.influencer?.last_name || '')).trim() || 'Unknown User'}</h2>
                      <Badge variant="secondary" className="text-xs">Influencer</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {userPresence[selectedConversation.influencer?.id || ''] ? 'Online' : 'Offline'}
                    </p>
                    {selectedConversation.campaign && (
                      <p className="text-xs text-blue-600">
                        Campaign: {selectedConversation.campaign.title}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[70%] bg-gray-200 rounded-lg p-3 animate-pulse">
                          <div className="h-4 bg-gray-300 rounded w-full mb-2" />
                          <div className="h-3 bg-gray-300 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversationMessages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  conversationMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex',
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-lg px-4 py-2',
                          message.sender_id === user?.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        )}
                      >
                        {message.message_type === 'text' && (
                          <p className="text-sm">{message.content}</p>
                        )}
                        {message.message_type === 'file' && (
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4" />
                            <span className="text-sm">{message.content}</span>
                          </div>
                        )}
                        {message.message_type === 'image' && (
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-sm">Image</span>
                          </div>
                        )}
                        <p className={cn(
                          'text-xs mt-1',
                          message.sender_id === user?.id ? 'text-green-100' : 'text-gray-500'
                        )}>
                        {formatTime(message?.created_at || "")}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    className="resize-none"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}