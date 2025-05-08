
import React from "react";
import { User } from "@/types";
import { MessageConversation } from "./MessageConversation";
import { Communication } from "@/types/communications/communicationTypes";
import { useMessageReadStatus } from "@/hooks/communications/useMessageReadStatus";
import { useAuth } from "@/contexts/AuthContext";

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
  
  // Use the hook to automatically mark messages as read
  useMessageReadStatus(selectedEmployee, currentUser, unreadMessages);

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
