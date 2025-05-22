
import React, { useState } from "react";
import { MessageItem } from "./MessageItem";
import { MessageSkeleton } from "./MessageSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { useRefreshMessages } from "@/hooks/communications/useRefreshMessages";
import { EmptyConversation } from "./conversation/EmptyConversation";
import { useGroupedMessages } from "@/hooks/communications/useGroupedMessages";
import { useUnreadMessageCount } from "@/hooks/communications/useUnreadMessageCount";
import { useMessageRefreshEffect } from "@/hooks/communications/useMessageRefreshEffect";
import { MessageListHeader } from "./MessageListHeader";
import { MessageListError } from "./MessageListError";

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
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
  
  // Use custom hooks
  const groupedMessages = useGroupedMessages(messages, currentUser?.id);
  const unreadCount = useUnreadMessageCount(unreadMessages, currentUser?.id);
  
  // Set up auto refresh effect
  useMessageRefreshEffect({ 
    refreshMessages, 
    isAdmin, 
    setLoadingFailed
  });
  
  // Function to handle manual refresh with state tracking
  const handleManualRefresh = async () => {
    setIsManuallyRefreshing(true);
    setLoadingFailed(false);
    
    try {
      await refreshMessages();
    } catch (error) {
      console.error("Error during manual refresh:", error);
      setLoadingFailed(true);
    } finally {
      setIsManuallyRefreshing(false);
    }
  };

  // Show loading error state if we've tried and failed to load
  if (loadingFailed && !isLoading && messages.length === 0) {
    return <MessageListError onRefresh={handleManualRefresh} isRefreshing={isManuallyRefreshing} />;
  }

  // Loading state
  if (isLoading) {
    return <MessageSkeleton />;
  }

  // Empty state
  if (groupedMessages.length === 0) {
    return <EmptyConversation onRefresh={handleManualRefresh} />;
  }

  return (
    <div className="space-y-4">
      <MessageListHeader unreadCount={unreadCount} />
      
      {groupedMessages.map(message => {
        // Determine if the message is incoming or outgoing
        const isOutgoing = message.sender_id === currentUser?.id;
        
        // Get the employee who is on the other end of the conversation
        const otherPersonId = isOutgoing ? message.recipient_id : message.sender_id;
        const otherPerson = employees.find(emp => emp.id === otherPersonId);

        if (!otherPerson) {
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
