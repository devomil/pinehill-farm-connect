
import { useMemo } from "react";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

export function useUnreadMessages(
  messages: Communication[] | null | undefined, 
  currentUser: User | null
): Communication[] {
  return useMemo(() => {
    if (!messages || !currentUser) return [];
    
    return messages.filter(message => {
      return (
        message.recipient_id === currentUser.id && 
        message.read_at === null
      );
    });
  }, [messages, currentUser]);
}
