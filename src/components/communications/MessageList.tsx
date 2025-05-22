
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { useEmployeeName } from "@/hooks/employee/useEmployeeName";
import { useUnreadMessageCount } from "@/hooks/communications/useUnreadMessageCount";
import { User } from "@/types";
import { MessageItem } from "./MessageItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { MessageListError } from "./MessageListError";
import { MessageListHeader } from "./MessageListHeader";
import { EmptyConversation } from "./conversation/EmptyConversation";
import { useGroupedMessages } from "@/hooks/communications/useGroupedMessages";
import { useMessageRefreshEffect } from "@/hooks/communications/useMessageRefreshEffect";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [navigationLoopDetected, setNavigationLoopDetected] = useState(false);
  const mountCount = useRef(0);
  const mountTimeRef = useRef(Date.now());
  const lastUnmountTimeRef = useRef<number | null>(null);
  const stableTimeRef = useRef<NodeJS.Timeout | null>(null);
  const refreshCountRef = useRef(0);
  const lastRefreshTime = useRef(0);
  
  // Group messages by conversation
  const groupedMessages = useGroupedMessages(messages, currentUserId);
  
  // Get unread message count
  const unreadCount = useUnreadMessageCount(unreadMessages);
  
  // Less aggressive loop detection
  useEffect(() => {
    mountCount.current += 1;
    mountTimeRef.current = Date.now();
    
    // Check if component is mounting too frequently - higher threshold
    if (mountCount.current > 8) { // Increased from 4 to 8
      console.warn(`MessageList mounted ${mountCount.current} times - possible navigation issue`);
      // Check if we're remounting too quickly after unmounting
      if (lastUnmountTimeRef.current) {
        const timeBetweenMounts = Date.now() - lastUnmountTimeRef.current;
        if (timeBetweenMounts < 500) { // Decreased sensitivity (from 1000 to 500)
          console.error(`MessageList remounted after only ${timeBetweenMounts}ms - navigation loop detected`);
          setNavigationLoopDetected(true);
        }
      }
    }
    
    // Set a timer to mark the component as "stable" if it stays mounted
    if (stableTimeRef.current) {
      clearTimeout(stableTimeRef.current);
    }
    
    stableTimeRef.current = setTimeout(() => {
      console.log("MessageList component considered stable (mounted for 5 seconds)");
      // Reset counter if component stays mounted for at least 5 seconds
      mountCount.current = 0;
      setNavigationLoopDetected(false);
    }, 5000);
    
    return () => {
      const mountDuration = Date.now() - mountTimeRef.current;
      lastUnmountTimeRef.current = Date.now();
      
      if (mountDuration < 500) { // Decreased sensitivity
        console.warn(`MessageList unmounted after only ${mountDuration}ms - possible navigation issue`);
      }
      
      if (stableTimeRef.current) {
        clearTimeout(stableTimeRef.current);
      }
    };
  }, []);
  
  // Auto refresh messages on mount (with proper type handling and rate limiting)
  useMessageRefreshEffect({
    refreshMessages: onRefresh ? async () => {
      // Check if we've refreshed too recently
      const now = Date.now();
      if (now - lastRefreshTime.current < 60000) { // 1 minute minimum between refreshes
        console.log("Skipping auto-refresh - too soon since last refresh");
        return;
      }
      
      // Limit max number of auto-refreshes
      if (refreshCountRef.current >= 1) { // Only allow 1 auto-refresh
        console.log("Max auto-refresh count reached");
        return;
      }
      
      refreshCountRef.current++;
      lastRefreshTime.current = now;
      
      return await onRefresh();
    } : async () => {},
    isAdmin: false, // Default to false, update this if you have access to user role info
    setLoadingFailed: setLoadingFailed
  });

  // Handle refresh action with rate limiting
  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!onRefresh || isRefreshing) return;
    
    // Prevent refreshing too often
    const now = Date.now();
    if (now - lastRefreshTime.current < 10000) { // 10 second minimum between manual refreshes
      toast.info("Please wait before refreshing again");
      return;
    }
    
    setIsRefreshing(true);
    lastRefreshTime.current = now;
    
    try {
      await onRefresh();
      toast.success("Messages refreshed");
    } catch (err) {
      console.error("Error refreshing messages:", err);
      toast.error("Failed to refresh messages");
      setLoadingFailed(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Get employee name helper function
  const getEmployeeName = useEmployeeName(employees);

  // Handle recovery from navigation loop
  const handleRecovery = () => {
    // Reset state
    mountCount.current = 0;
    setNavigationLoopDetected(false);
    
    // Force navigation with recovery flag
    const timestamp = Date.now();
    navigate(`/communication?tab=announcements`, { replace: true });
    
    // After short delay, return to messages tab in recovery mode
    setTimeout(() => {
      navigate(`/communication?tab=messages&recovery=true&ts=${timestamp}`, { replace: true });
      toast.success("Navigation recovery attempted");
    }, 1000);
  };

  // Handle navigation loop detected
  if (navigationLoopDetected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription className="space-y-2">
          <p className="mb-2">Navigation issue detected - Direct Messages tab is reloading repeatedly.</p>
          <Button 
            variant="outline" 
            onClick={handleRecovery}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Attempt Recovery
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Handle empty state
  if (!loading && !error && groupedMessages.length === 0) {
    return <EmptyConversation onRefresh={handleRefresh} />;
  }

  // Handle error state
  if (error || loadingFailed) {
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
