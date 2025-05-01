
import React from "react";
import { Card } from "@/components/ui/card";
import { MessageConversation } from "./MessageConversation";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

interface EmployeeConversationViewProps {
  selectedEmployee: User | null;
  messages: Communication[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void;
}

export function EmployeeConversationView({
  selectedEmployee,
  messages,
  isLoading,
  onSendMessage,
  onBack
}: EmployeeConversationViewProps) {
  return (
    <Card className="md:col-span-2">
      <MessageConversation
        selectedEmployee={selectedEmployee}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={onSendMessage}
        onBack={onBack}
      />
    </Card>
  );
}
