
import React, { useState, useCallback, useRef } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { useEmployeeName } from "@/hooks/employee/useEmployeeName";
import { useUnreadMessageCount } from "@/hooks/communications/useUnreadMessageCount";
import { User } from "@/types";
import { MessageItem } from "./MessageItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { MessageListError } from "./MessageListError";
import { MessageListHeader } from "./MessageListHeader";
import { EmptyConversation } from "./conversation/EmptyConversation";
import { useGroupedMessages } from "@/hooks/communications/useGroupedMessages";
import { useMessageRefreshEffect } from "@/hooks/communications/useMessageRefreshEffect";
import { toast } from "sonner";

interface MessageListProps {
  messages: Communication[];
  employees: User[];
  loading: boolean;
  error?: Error | null;
  onViewConversation: (employee: User) => void;
  onRespond: (data: {
    communicationId: string;
    shiftRequestId: string;
    accept: boolean;
    senderId: string;
  }) => void;
  onRefresh?: () => Promise<void>;
  currentUserId?: string;
  unreadMessages?: Communication[];
}

export function MessageList({
  messages,
  employees,
  loading,
  error,
  onViewConversation,
  onRespond,
  onRefresh,
  currentUserId,
  unreadMessages = []
}: MessageListProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);
  
  // Group messages by conversation
  const groupedMessages = useGroupedMessages(messages, currentUserId);
  
  // Get unread message count
  const unreadCount = useUnreadMessageCount(unreadMessages);
  
  // Auto refresh messages on mount or when unread count changes
  // Create a proper object to pass to useMessageRefreshEffect
  useMessageRefreshEffect({
    refreshMessages: onRefresh || (async () => {}),
    isAdmin: false, // Default to false, update this if you have access to user role info
    setLoadingFailed: setLoadingFailed
  });

  // Handle refresh action
  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success("Messages refreshed");
    } catch (err) {
      console.error("Error refreshing messages:", err);
      toast.error("Failed to refresh messages");
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Get employee name helper function
  const getEmployeeName = useEmployeeName(employees);

  // Handle empty state
  if (!loading && !error && groupedMessages.length === 0) {
    return <EmptyConversation onRefresh={handleRefresh} />;
  }

  // Handle error state
  if (error) {
    return <MessageListError onRefresh={handleRefresh} isRefreshing={isRefreshing} />;
  }

  return (
    <div className="space-y-4">
      {/* Header showing number of unread messages */}
      <MessageListHeader unreadCount={unreadCount} />
      
      {/* Refresh button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      {/* Message list */}
      <div className="space-y-4">
        {loading ? (
          // Loading state
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-2 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </Card>
            ))
        ) : (
          groupedMessages.map((message) => {
            // Determine if message is outgoing
            const isOutgoing = message.sender_id === currentUserId;
            
            // Get the ID of the other person in conversation
            const otherPersonId = isOutgoing
              ? message.recipient_id
              : message.sender_id;
              
            // Find other person's details
            const otherPerson = employees.find((emp) => emp.id === otherPersonId);
            
            if (!otherPerson) {
              console.error(`Could not find employee with ID: ${otherPersonId}`);
              return null;
            }

            // Check if message is unread
            const isUnread =
              !isOutgoing && 
              message.read_at === null;

            return (
              <MessageItem
                key={message.id}
                message={message}
                recipient={otherPerson}
                isOutgoing={isOutgoing}
                isUnread={isUnread}
                onRespond={onRespond}
                onViewConversation={() => onViewConversation(otherPerson)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
