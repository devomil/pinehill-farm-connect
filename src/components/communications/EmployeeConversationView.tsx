
import React from "react";
import { Card } from "@/components/ui/card";
import { MessageConversation } from "./MessageConversation";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

interface EmployeeConversationViewProps {
  employee?: User | null;
  selectedEmployee?: User | null;
  messages: Communication[];
  loading: boolean;
  isLoading?: boolean;
  onSendMessage: (message: string) => void;
  onBack?: () => void;
  onRefresh?: () => void;
}

export function EmployeeConversationView({
  employee,
  selectedEmployee,
  messages,
  loading,
  isLoading,
  onSendMessage,
  onBack,
  onRefresh
}: EmployeeConversationViewProps) {
  // Use either employee or selectedEmployee, whichever is provided
  const employeeToUse = employee || selectedEmployee;

  return (
    <Card className="md:col-span-2">
      <MessageConversation
        selectedEmployee={employeeToUse}
        messages={messages}
        isLoading={isLoading || loading}
        onSendMessage={onSendMessage}
        onBack={onBack}
        onRefresh={onRefresh}
      />
    </Card>
  );
}
