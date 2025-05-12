
import React, { useMemo, useEffect } from "react";
import { MessageItem } from "./MessageItem";
import { EmptyMessageState } from "./EmptyMessageState";
import { MessageSkeleton } from "./MessageSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { useRefreshMessages } from "@/hooks/communications/useRefreshMessages";

interface MessageListProps {
  messages: Communication[];
  isLoading: boolean;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  employees: User[];
  onViewConversation: (employee: User) => void;
  unreadMessages?: Communication[];
}

export function MessageList({ 
  messages, 
  isLoading, 
  onRespond, 
  employees, 
  onViewConversation,
  unreadMessages = []
}: MessageListProps) {
  const { currentUser } = useAuth();
  const refreshMessages = useRefreshMessages();
  const isAdmin = currentUser?.role === 'admin';

  // Group messages by conversation
  const groupedMessages = useMemo(() => {
    // Sort messages by time, newest first
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Group by unique conversation (combination of sender and recipient)
    const conversations = new Map();

    sortedMessages.forEach(message => {
      const otherId = 
        message.sender_id === currentUser?.id 
          ? message.recipient_id 
          : message.sender_id;
          
      // Skip if we've already added this conversation
      if (!conversations.has(otherId)) {
        const latestMessage = sortedMessages.find(
          msg => (msg.sender_id === otherId || msg.recipient_id === otherId)
        );
        
        if (latestMessage) {
          conversations.set(otherId, latestMessage);
        }
      }
    });

    return Array.from(conversations.values());
  }, [messages, currentUser]);

  // Count unread direct messages - explicitly only count direct message types
  // and ensure they are actually unread and directed to the current user
  const unreadCount = unreadMessages?.filter(
    msg => (msg.type === 'general' || msg.type === 'shift_coverage' || msg.type === 'urgent') &&
           msg.recipient_id === currentUser?.id &&
           msg.read_at === null
  ).length || 0;
  
  // Auto-refresh messages when component mounts to ensure accurate counts
  useEffect(() => {
    refreshMessages();
    
    // More frequent refresh for admin users
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing message list");
      refreshMessages();
    }, isAdmin ? 20000 : 30000); // Every 20 seconds for admins, 30 for others
    
    return () => clearInterval(refreshInterval);
  }, [refreshMessages, isAdmin]);

  // Loading state
  if (isLoading) {
    return <MessageSkeleton />;
  }

  // Empty state
  if (groupedMessages.length === 0) {
    return <EmptyMessageState />;
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="bg-muted/30 p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm font-medium">You have new messages</span>
          </div>
          <Badge variant="default">{unreadCount} unread</Badge>
        </div>
      )}
      
      {groupedMessages.map(message => {
        // Determine if the message is incoming or outgoing
        const isOutgoing = message.sender_id === currentUser?.id;
        
        // Get the employee who is on the other end of the conversation
        const otherPersonId = isOutgoing ? message.recipient_id : message.sender_id;
        const otherPerson = employees.find(emp => emp.id === otherPersonId);

        if (!otherPerson) {
          console.warn(`Could not find employee with ID ${otherPersonId}`);
          return null;
        }

        // Check if this is unread
        const isUnread = !isOutgoing && !message.read_at;

        return (
          <MessageItem
            key={message.id}
            message={message}
            recipient={otherPerson}
            isOutgoing={isOutgoing}
            onRespond={onRespond}
            onViewConversation={() => onViewConversation(otherPerson)}
            isUnread={isUnread}
          />
        );
      })}
    </div>
  );
}
