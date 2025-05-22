
import React, { useEffect, useRef } from "react";
import { Alert } from "@/components/ui/alert";
import { Communication } from "@/types/communications/communicationTypes";
import { MessageBubble } from "./MessageBubble";
import { MessageListSkeleton } from "./MessageListSkeleton";
import { EmptyConversationState } from "./EmptyConversationState";

interface MessageListProps {
  messages: Communication[];
  isLoading: boolean;
  currentUserId: string | undefined;
}

export function MessageList({ messages, isLoading, currentUserId }: MessageListProps) {
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  if (messages.length === 0) {
    return <EmptyConversationState />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isMine = message.sender_id === currentUserId;
        return <MessageBubble key={message.id} message={message} isMine={isMine} />;
      })}
      <div ref={messageEndRef} />
    </div>
  );
}
