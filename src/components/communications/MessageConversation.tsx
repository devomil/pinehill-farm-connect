
import React from "react";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { ConversationHeader } from "./conversation/ConversationHeader";
import { MessageList } from "./conversation/MessageList";
import { MessageInput } from "./conversation/MessageInput";
import { EmptyConversation } from "./conversation/EmptyConversation";
import { useConversation } from "@/hooks/communications/useConversation";

interface MessageConversationProps {
  selectedEmployee: User | null;
  messages: Communication[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onBack: () => void;
}

export function MessageConversation({
  selectedEmployee,
  messages,
  isLoading,
  onSendMessage,
  onBack
}: MessageConversationProps) {
  const { filteredMessages, currentUser } = useConversation(selectedEmployee, messages);

  if (!selectedEmployee) {
    return <EmptyConversation />;
  }

  return (
    <div className="flex flex-col h-[70vh] border rounded-md">
      <ConversationHeader selectedEmployee={selectedEmployee} onBack={onBack} />
      <MessageList 
        messages={filteredMessages} 
        isLoading={isLoading} 
        currentUserId={currentUser?.id} 
      />
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
