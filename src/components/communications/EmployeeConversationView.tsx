
import React from "react";
import { User } from "@/types";
import { MessageConversation } from "./MessageConversation";
import { Communication } from "@/types/communications/communicationTypes";

interface EmployeeConversationViewProps {
  selectedEmployee: User;
  messages: Communication[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  onBack?: () => void;
  onRefresh?: () => void;
}

export function EmployeeConversationView({
  selectedEmployee,
  messages,
  loading,
  onSendMessage,
  onBack,
  onRefresh
}: EmployeeConversationViewProps) {
  // Mark messages as read immediately when viewing a conversation
  // This is just visual feedback; the actual marking happens in the backend

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
