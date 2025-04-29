
import React from "react";
import { User } from "@/types";
import { MessageSkeleton } from "./MessageSkeleton";
import { EmptyMessageState } from "./EmptyMessageState";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: any[];
  isLoading: boolean;
  onRespond: (data: { communicationId: string; shiftRequestId: string; accept: boolean; senderId: string }) => void;
  employees: User[];
  onViewConversation?: (employee: User) => void;
}

export function MessageList({ messages, isLoading, onRespond, employees, onViewConversation }: MessageListProps) {
  if (isLoading) {
    return <MessageSkeleton />;
  }

  if (!messages || messages.length === 0) {
    return <EmptyMessageState />;
  }

  const getEmployeeName = (id: string) => {
    const employee = employees.find((e) => e.id === id);
    return employee?.name || "Unknown User";
  };

  const getEmployeeById = (id: string) => {
    return employees.find((e) => e.id === id);
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isIncoming = message.recipient_id === message.current_user_id;
        // Determine which user to show in the conversation link
        const conversationUser = isIncoming 
          ? getEmployeeById(message.sender_id)
          : getEmployeeById(message.recipient_id);
        
        return (
          <MessageItem
            key={message.id}
            message={message}
            onRespond={onRespond}
            getEmployeeName={getEmployeeName}
            onViewConversation={onViewConversation}
            conversationUser={conversationUser}
          />
        );
      })}
    </div>
  );
}
