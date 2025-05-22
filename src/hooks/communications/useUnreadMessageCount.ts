
import { useMemo } from 'react';
import { Communication } from '@/types/communications/communicationTypes';

/**
 * Returns the count of unread messages
 * @param messages Array of messages to check
 * @returns Number of unread messages
 */
export function useUnreadMessageCount(messages: Communication[] = []) {
  return useMemo(() => {
    return messages.filter(message => message.read_at === null).length;
  }, [messages]);
}
