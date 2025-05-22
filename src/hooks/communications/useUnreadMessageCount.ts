
import { useMemo } from "react";
import { Communication } from "@/types/communications/communicationTypes";

/**
 * Calculate the number of unread messages for the current user
 */
export function useUnreadMessageCount(
  unreadMessages: Communication[] = [], 
  currentUserId: string | undefined
) {
  return useMemo(() => unreadMessages?.filter(
    msg => (msg.type === 'general' || msg.type === 'shift_coverage' || msg.type === 'urgent') &&
           msg.recipient_id === currentUserId &&
           msg.read_at === null
  ).length || 0, [unreadMessages, currentUserId]);
}
