
import React, { useEffect, useRef } from "react";
import { User } from "@/types";
import { MessageConversation } from "./MessageConversation";
import { Communication } from "@/types/communications/communicationTypes";
import { useMessageReadStatus } from "@/hooks/communications/useMessageReadStatus";
import { useAuth } from "@/contexts/AuthContext";
import { useRefreshMessages } from "@/hooks/communications/useRefreshMessages";

interface EmployeeConversationViewProps {
  selectedEmployee: User;
  messages: Communication[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  onBack?: () => void;
  onRefresh?: () => void;
  unreadMessages?: Communication[];
}

export function EmployeeConversationView({
  selectedEmployee,
  messages,
  loading,
  onSendMessage,
  onBack,
  onRefresh,
  unreadMessages = []
}: EmployeeConversationViewProps) {
  const { currentUser } = useAuth();
  const { refresh } = useRefreshMessages();
  const initialRefreshDone = useRef(false);
  const lastConversationId = useRef<string | null>(null);
  
  // Use the hook to automatically mark messages as read
  useMessageReadStatus(selectedEmployee, currentUser, unreadMessages);
  
  // Additional effect to ensure we refresh message data only when the employee changes or on initial load
  useEffect(() => {
    // Create a unique ID for this conversation
    const conversationId = selectedEmployee?.id;
    
    // Only refresh if employee changes or there are unread messages on first load
    const shouldRefresh = 
      (conversationId !== lastConversationId.current) || 
      (!initialRefreshDone.current && unreadMessages.length > 0);
    
    if (shouldRefresh) {
      console.log("EmployeeConversationView - employee selected or changed, refreshing once");
      initialRefreshDone.current = true;
      lastConversationId.current = conversationId;
      refresh();
    }
  }, [selectedEmployee?.id, refresh, unreadMessages.length]);

  return (
    <div className="h-full">
      <MessageConversation
        selectedEmployee={selectedEmployee}
        messages={messages}
        isLoading={loading}
        onSendMessage={onSendMessage}
        onBack={onBack}
        onRefresh={onRefresh}
      />
    </div>
  );
}
