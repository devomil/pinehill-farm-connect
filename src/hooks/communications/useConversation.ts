
import { useEffect, useState } from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useConversation(
  selectedEmployee: User | null,
  messages: Communication[]
) {
  const { currentUser } = useAuth();
  const [filteredMessages, setFilteredMessages] = useState<Communication[]>([]);

  // Filter messages between the current user and selected employee
  useEffect(() => {
    if (selectedEmployee && messages && currentUser) {
      const relevant = messages.filter(
        (msg) =>
          (msg.sender_id === currentUser.id &&
            msg.recipient_id === selectedEmployee.id) ||
          (msg.sender_id === selectedEmployee.id &&
            msg.recipient_id === currentUser.id)
      );
      
      // Sort by date ascending (oldest first)
      relevant.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setFilteredMessages(relevant);
    } else {
      setFilteredMessages([]);
    }
  }, [selectedEmployee, messages, currentUser]);

  return {
    filteredMessages,
    currentUser
  };
}
