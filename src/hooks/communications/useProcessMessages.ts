
import { useMemo } from 'react';
import { User } from '@/types';
import { Communication } from '@/types/communications/communicationTypes';

export function useProcessMessages(messages: Communication[] | undefined, currentUser: User | null) {
  return useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Return properly typed messages
    return messages as Communication[];
  }, [messages]);
}
