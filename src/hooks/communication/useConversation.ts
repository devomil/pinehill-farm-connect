
import { useMemo } from "react";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { useAuth } from "@/contexts/AuthContext";

export function useConversation(selectedEmployee: User | null, messages: Communication[]) {
  const { currentUser } = useAuth();

  const filteredMessages = useMemo(() => {
    if (!selectedEmployee || !currentUser) return [];

    return messages.filter(
      (message) =>
        (message.sender_id === selectedEmployee.id && message.recipient_id === currentUser.id) ||
        (message.recipient_id === selectedEmployee.id && message.sender_id === currentUser.id)
    );
  }, [selectedEmployee, currentUser, messages]);

  return { filteredMessages, currentUser };
}
