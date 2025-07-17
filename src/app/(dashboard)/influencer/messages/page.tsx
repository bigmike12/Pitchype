"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useNotifications } from "@/hooks/useNotifications";
import { useConversations } from "@/hooks/useConversations";
import { toast } from "sonner";

import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Filter,
  MessageCircle,
  Clock,
  CheckCheck,
  Check,
  Phone,
  Video,
  Info,
} from "lucide-react";
import { MotionDiv } from "@/components/performance/LazyMotion";

// Message interface
interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  sender?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Transform function to convert hook data to UI format
const transformConversationForUI = (conv: any) => {
  const participant = conv.business || conv.influencer;
  const participantName = participant 
    ? `${participant.first_name || ''} ${participant.last_name || ''}`.trim() || participant.company_name || 'Unknown'
    : 'Unknown';
  
  return {
    ...conv,
    participant: {
      id: participant?.id || '',
      name: participantName,
      avatar: participant?.avatar_url,
      company: conv.business?.company_name,
      role: conv.business ? 'business' as const : 'influencer' as const,
      isOnline: false, // Will be updated by presence
      lastSeen: undefined
    },
    lastMessage: conv.last_message ? {
      content: conv.last_message,
      timestamp: conv.last_message_at || conv.created_at,
      sender_id: '' // Not available in this format
    } : null,
    unreadCount: conv.unread_count || 0,
    isStarred: false, // Not available in current schema
    isArchived: false, // Not available in current schema
    createdAt: conv.created_at,
    messages: [] // Will be populated separately
  };
};

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    company?: string;
    role: "business" | "influencer";
    isOnline: boolean;
    lastSeen?: string;
  };
  campaign?: {
    id: string;
    title: string;
    status: "active" | "completed" | "pending";
  };
  lastMessage: {
    content: string;
    timestamp: string;
    sender_id: string;
  };
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { getMultipleUserPresence: _getMultipleUserPresence } = useUserPresence();
  
  // Memoize getMultipleUserPresence to prevent infinite loops
  const getMultipleUserPresence = useCallback(_getMultipleUserPresence, []);
  const { notifications } = useNotifications();
  
  // Use the new useConversations hook
  const { 
    conversations: rawConversations, 
    loading: conversationsLoading, 
    updateConversationOnlineStatus 
  } = useConversations();
  
  // Transform conversations for UI
  const conversations = rawConversations.map(transformConversationForUI);
  
  const [selectedConversation, setSelectedConversation] =
    useState<any>(null);
  // Only use useMessages when we have a valid applicationId
  const shouldUseMessages = Boolean(selectedConversation?.application_id);
  const { 
    messages: conversationMessages, 
    sendMessage, 
    loading: messagesLoading 
  } = useMessages({
    applicationId: shouldUseMessages ? selectedConversation.application_id : "skip"
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [userPresence, setUserPresence] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showConversationInfo, setShowConversationInfo] = useState(false);

  // Update online status for conversations
  const updateConversationsOnlineStatus = async (
    conversationList: Conversation[]
  ) => {
    if (conversationList.length === 0) return conversationList;

    const userIds = conversationList.map((conv) => conv.participant.id);
    const presenceData = await getMultipleUserPresence(userIds);
    setUserPresence(presenceData);

    return conversationList.map((conv) => ({
      ...conv,
      participant: {
        ...conv.participant,
        isOnline: presenceData[conv.participant.id] || false,
      },
    }));
  };

  // Auto-select first conversation when conversations are loaded
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const filters = [
    { value: "all", label: "All Messages" },
    { value: "unread", label: "Unread" },
    { value: "starred", label: "Starred" },
    { value: "archived", label: "Archived" },
    { value: "active_campaigns", label: "Active Campaigns" },
    { value: "completed_campaigns", label: "Completed Campaigns" },
  ];

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      conversation.participant.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.participant.company
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.campaign?.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    switch (selectedFilter) {
      case "unread":
        return matchesSearch && conversation.unreadCount > 0;
      case "starred":
        return matchesSearch && conversation.isStarred;
      case "archived":
        return matchesSearch && conversation.isArchived;
      case "active_campaigns":
        return matchesSearch && conversation.campaign?.status === "active";
      case "completed_campaigns":
        return matchesSearch && conversation.campaign?.status === "completed";
      default:
        return matchesSearch && !conversation.isArchived;
    }
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return;

    try {
      await sendMessage({
        content: messageInput.trim(),
        message_type: "text"
      });
      setMessageInput("");
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const toggleStar = (conversationId: string) => {
    // TODO: Implement star toggle with API call
    toast.info("Star functionality not yet implemented");
  };

  const toggleArchive = (conversationId: string) => {
    // TODO: Implement archive toggle with API call
    toast.info("Archive functionality not yet implemented");
  };

  const markAsRead = (conversationId: string) => {
    // TODO: Implement mark as read with API call
    toast.info("Mark as read functionality not yet implemented");
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp || timestamp.trim() === "") {
      return "";
    }

    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">
                Start by applying to campaigns to begin messaging with
                businesses.
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation, index) => (
              <MotionDiv
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? "bg-green-50 border-l-4 border-l-green-500"
                    : ""
                }`}
                onClick={() => {
                  setSelectedConversation(conversation);
                  markAsRead(conversation.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.participant.avatar} />
                      <AvatarFallback>
                        {conversation.participant.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {userPresence[conversation.participant.id] && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">
                          {conversation.participant.name}
                        </h3>
                        {conversation.isStarred && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(
                            conversation.lastMessage?.timestamp || ""
                          )}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-1">
                      {conversation.participant.company}
                    </p>

                    {conversation.campaign && (
                      <Badge
                        className={`text-xs mb-2 ${getCampaignStatusColor(conversation.campaign.status)}`}
                      >
                        {conversation.campaign.title}
                      </Badge>
                    )}

                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.sender_id === user?.id
                            ? "You: "
                            : ""}
                          {conversation.lastMessage.content}
                        </>
                      ) : (
                        "No messages yet"
                      )}
                    </p>
                  </div>
                </div>
              </MotionDiv>
            ))
          )}
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
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={selectedConversation.participant.avatar}
                      />
                      <AvatarFallback>
                        {selectedConversation.participant.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {selectedConversation.participant.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.participant.isOnline
                        ? "Online"
                        : selectedConversation.participant.lastSeen
                          ? `Last seen ${formatTime(selectedConversation.participant.lastSeen)}`
                          : "Offline"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStar(selectedConversation.id)}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        selectedConversation.isStarred
                          ? "text-yellow-500 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowConversationInfo(!showConversationInfo)
                    }
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {selectedConversation.campaign && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {selectedConversation.campaign.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedConversation.participant.company}
                      </p>
                    </div>
                    <Badge
                      className={getCampaignStatusColor(
                        selectedConversation.campaign.status
                      )}
                    >
                      {selectedConversation.campaign.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                    >
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
                conversationMessages.map((message, index) => (
                  <MotionDiv
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${
                      message.sender_id === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.sender_id === user?.id ? "order-2" : "order-1"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender_id === user?.id
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>

                        {message.attachments && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-white/10 rounded">
                              <Paperclip className="w-4 h-4" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  Attachment
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                          message.sender_id === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <span>
                          {formatTime(message.created_at)}
                        </span>
                        {message.sender_id === user?.id && (
                          <div className="flex items-center">
                            {message.is_read ? (
                              <CheckCheck className="w-3 h-3 text-green-500" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </MotionDiv>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-3">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-32 resize-none"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversation selected
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Info Sidebar */}
      {showConversationInfo && selectedConversation && (
        <MotionDiv
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Participant Info */}
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-3">
                <AvatarImage src={selectedConversation.participant.avatar} />
                <AvatarFallback className="text-lg">
                  {selectedConversation.participant.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">
                {selectedConversation.participant.name}
              </h3>
              <p className="text-gray-600">
                {selectedConversation.participant.company}
              </p>
              <Badge
                className={`mt-2 ${
                  selectedConversation.participant.isOnline
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedConversation.participant.isOnline
                  ? "Online"
                  : "Offline"}
              </Badge>
            </div>

            <div className="border-t" />

            {/* Campaign Info */}
            {selectedConversation.campaign && (
              <div>
                <h4 className="font-medium mb-3">Campaign Details</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Campaign</p>
                    <p className="font-medium">
                      {selectedConversation.campaign.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge
                      className={getCampaignStatusColor(
                        selectedConversation.campaign.status
                      )}
                    >
                      {selectedConversation.campaign.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t" />

            {/* Actions */}
            <div className="space-y-3">
              <h4 className="font-medium">Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Conversation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Conversation
                </Button>
              </div>
            </div>
          </div>
        </MotionDiv>
      )}
    </div>
  );
}
