
import { useGetCommunications } from "./communications";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export const useCommunications = () => {
  const { currentUser } = useAuth();
  const { data: messages, isLoading, error } = useGetCommunications();
  
  const unreadMessages = useMemo(() => {
    if (!messages || !currentUser) return [];
    
    // Filter messages to find unread ones directed to the current user
    return messages.filter(
      message => 
        message.recipient_id === currentUser.id && 
        !message.read_at
    );
  }, [messages, currentUser]);
  
  return {
    messages,
    unreadMessages,
    isLoading,
    error
  };
};
