
import { useMemo, useRef } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";

/**
 * Custom hook to group messages by conversation
 */
export function useGroupedMessages(
  messages: Communication[], 
  currentUserId: string | undefined
) {
  // Compute a hash of the messages to detect real changes
  const messageHashRef = useRef<string>("");
  const groupedMessagesRef = useRef<Communication[]>([]);
  
  const messagesHash = useMemo(() => {
    return messages.map(m => m.id).join(',');
  }, [messages]);

  // Group messages by conversation with improved memoization
  const groupedMessages = useMemo(() => {
    // Skip recomputation if messages haven't changed
    if (messageHashRef.current === messagesHash && messageHashRef.current !== "") {
      return groupedMessagesRef.current;
    }
    
    // Sort messages by time, newest first
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Group by unique conversation (combination of sender and recipient)
    const conversations = new Map();

    sortedMessages.forEach(message => {
      const otherId = 
        message.sender_id === currentUserId 
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
    
    const result = Array.from(conversations.values());
    messageHashRef.current = messagesHash;
    groupedMessagesRef.current = result;
    return result;
  }, [messages, messagesHash, currentUserId]);

  return groupedMessages;
}
