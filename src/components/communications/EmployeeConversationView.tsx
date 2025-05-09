
import React, { useEffect } from "react";
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
  const refresh = useRefreshMessages();
  
  // Use the hook to automatically mark messages as read
  useMessageReadStatus(selectedEmployee, currentUser, unreadMessages);
  
  // Additional effect to ensure we refresh message data when the component mounts or employee changes
  useEffect(() => {
    if (selectedEmployee && unreadMessages.length > 0) {
      console.log("EmployeeConversationView - employee selected with unread messages, refreshing");
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
