
import { useMemo } from "react";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

export function useUnreadMessages(messages: Communication[] | null, currentUser: User | null) {
  return useMemo(() => {
    if (!messages || !currentUser) return [];
    
    // Filter messages to find unread ones directed to the current user
    return messages.filter(
      message => 
        message.recipient_id === currentUser.id && 
        !message.read_at
    );
  }, [messages, currentUser]);
}
