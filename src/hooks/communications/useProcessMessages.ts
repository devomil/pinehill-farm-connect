
import { useMemo } from 'react';
import { User } from '@/types';
import { Communication, MessageType } from '@/types/communications/communicationTypes';

export function useProcessMessages(messages: any[] | undefined, currentUser: User | null) {
  return useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Convert string types to MessageType enum values
    const processedMessages = messages.map(message => {
      // Ensure the type property is one of the valid MessageType values
      let messageType: MessageType = 'general';
      
      if (
        message.type === 'general' ||
        message.type === 'shift_coverage' ||
        message.type === 'urgent' ||
        message.type === 'system_notification' ||
        message.type === 'announcement'
      ) {
        messageType = message.type as MessageType;
      }

      return {
        ...message,
        type: messageType
      } as Communication;
    });

    return processedMessages;
  }, [messages]);
}
