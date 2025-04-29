
import React, { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageItem } from "./MessageItem";
import { EmptyMessageState } from "./EmptyMessageState";
import { MessageSkeleton } from "./MessageSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { MessageListProps } from "@/types/communications/messageTypes";

export function MessageList({ messages, isLoading, onRespond, employees, onViewConversation }: MessageListProps) {
  const { currentUser } = useAuth();

  // Group messages by conversation
  const groupedMessages = useMemo(() => {
    // Sort messages by time, newest first
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Group by unique conversation (combination of sender and recipient)
    const conversations = new Map();

    sortedMessages.forEach(message => {
      const otherId = 
        message.sender_id === currentUser?.id 
          ? message.recipient_id 
          : message.sender_id;
          
      // Skip if we've already added this conversation
      if (!conversations.has(otherId)) {
        const latestMessage = sortedMessages.find(
          msg => (msg.sender_id === otherId || msg.recipient_id === otherId)
        );
        
        if (latestMessage) {
          conversations.set(otherId, latestMessage);
        }
      }
    });

    return Array.from(conversations.values());
  }, [messages, currentUser]);

  // Loading state
  if (isLoading) {
    return <MessageSkeleton />;
  }

  // Empty state
  if (groupedMessages.length === 0) {
    return <EmptyMessageState />;
  }

  return (
    <div className="space-y-4">
      {groupedMessages.map(message => {
        // Determine if the message is incoming or outgoing
        const isOutgoing = message.sender_id === currentUser?.id;
        
        // Get the employee who is on the other end of the conversation
        const otherPersonId = isOutgoing ? message.recipient_id : message.sender_id;
        const otherPerson = employees.find(emp => emp.id === otherPersonId);

        if (!otherPerson) {
          console.warn(`Could not find employee with ID ${otherPersonId}`);
          return null;
        }

        return (
          <MessageItem
            key={message.id}
            message={message}
            recipient={otherPerson}
            isOutgoing={isOutgoing}
            onRespond={onRespond}
            onViewConversation={() => onViewConversation(otherPerson)}
          />
        );
      })}
    </div>
  );
}
