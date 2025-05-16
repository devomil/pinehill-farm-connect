
import React, { useMemo, useEffect, useRef } from "react";
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
  const refreshIntervalRef = useRef<number | null>(null);
  const initialLoadRef = useRef<boolean>(false);
  const messageHashRef = useRef<string>("");
  const componentMountedAt = useRef(Date.now());
  const refreshAttemptCount = useRef(0);
  const MAX_AUTO_REFRESHES = 5; // Limit auto refreshes
  
  // Compute a hash of the messages to detect real changes
  const messagesHash = useMemo(() => {
    return messages.map(m => m.id).join(',');
  }, [messages]);

  // Group messages by conversation with improved memoization
  const groupedMessages = useMemo(() => {
    // Skip recomputation if messages haven't changed
    if (messageHashRef.current === messagesHash && messageHashRef.current !== "") {
      return groupedMessagesRef.current;
    }
    
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
    
    const result = Array.from(conversations.values());
    messageHashRef.current = messagesHash;
    groupedMessagesRef.current = result;
    return result;
  }, [messages, messagesHash, currentUser?.id]);
  
  // Ref to store the latest computed grouped messages
  const groupedMessagesRef = useRef<Communication[]>([]);

  // Count unread direct messages with improved memoization
  const unreadCount = useMemo(() => unreadMessages?.filter(
    msg => (msg.type === 'general' || msg.type === 'shift_coverage' || msg.type === 'urgent') &&
           msg.recipient_id === currentUser?.id &&
           msg.read_at === null
  ).length || 0, [unreadMessages, currentUser]);
  
  // Auto-refresh messages with much less frequency to reduce server load
  useEffect(() => {
    console.log(`MessageList component mounted at ${new Date().toISOString()}`);
    
    // Clear any existing interval when component re-renders
    if (refreshIntervalRef.current !== null) {
      clearInterval(refreshIntervalRef.current);
    }
    
    // Initial load only once
    if (!initialLoadRef.current) {
      console.log("Initial message list data load");
      
      // Delay initial refresh to ensure component is fully mounted
      const initialTimer = setTimeout(() => {
        refreshMessages();
        initialLoadRef.current = true;
      }, 1500);
      
      return () => clearTimeout(initialTimer);
    }
    
    // Set up refresh interval with much longer timing and limited refreshes
    const refreshHandler = () => {
      // Don't refresh if we've hit the limit
      if (refreshAttemptCount.current >= MAX_AUTO_REFRESHES) {
        console.log(`Auto-refresh limit reached (${MAX_AUTO_REFRESHES}), stopping automatic refreshes`);
        if (refreshIntervalRef.current !== null) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
        return;
      }
      
      console.log(`Auto-refreshing message list (${refreshAttemptCount.current + 1}/${MAX_AUTO_REFRESHES})`);
      refreshAttemptCount.current++;
      refreshMessages();
    };
    
    // Much longer intervals to prevent excessive refreshes
    const interval = window.setInterval(refreshHandler, isAdmin ? 240000 : 300000); // Every 4-5 minutes
    
    refreshIntervalRef.current = interval as unknown as number;
    
    return () => {
      console.log(`MessageList component unmounting after ${Date.now() - componentMountedAt.current}ms`);
      if (refreshIntervalRef.current !== null) {
        clearInterval(refreshIntervalRef.current);
      }
    };
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
