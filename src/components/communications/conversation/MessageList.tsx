
import React, { useEffect, useRef } from "react";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Communication } from "@/types/communications/communicationTypes";
import { MessageBubble } from "./MessageBubble";

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
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  i % 2 === 0 ? "bg-muted" : "bg-primary text-primary-foreground"
                } rounded-lg p-3`}
              >
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-full" />
                <div className="text-xs mt-1 opacity-70">
                  <Skeleton className="h-3 w-16 inline-block" />
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Alert className="mx-auto max-w-md">
          <p>No messages yet. Send a message to start the conversation.</p>
        </Alert>
      </div>
    );
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
