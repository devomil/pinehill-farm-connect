
import { useMemo } from 'react';
import { User } from '@/types';
import { Communication } from '@/types/communications/communicationTypes';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to filter messages for a specific conversation
 */
export function useConversation(
  selectedEmployee: User | null,
  messages: Communication[]
) {
  const { currentUser } = useAuth();

  const filteredMessages = useMemo(() => {
    if (!selectedEmployee || !currentUser || !messages.length) {
      return [];
    }

    // Filter messages to show only those between the current user and the selected employee
    return messages.filter(
      msg => 
        (msg.sender_id === currentUser.id && msg.recipient_id === selectedEmployee.id) ||
        (msg.sender_id === selectedEmployee.id && msg.recipient_id === currentUser.id)
    ).sort(
      // Sort by created_at date, oldest first
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [selectedEmployee, currentUser, messages]);

  return { 
    filteredMessages,
    currentUser
  };
}
