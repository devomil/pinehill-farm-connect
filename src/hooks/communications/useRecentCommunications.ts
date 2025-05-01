
import { useMemo } from "react";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { isAfter, subDays } from "date-fns";

/**
 * Hook to identify users with recent communications
 */
export function useRecentCommunications(
  messages: Communication[],
  currentUserId: string | undefined,
  employees: User[],
  daysThreshold: number = 7
): User[] {
  return useMemo(() => {
    if (!messages || !currentUserId || !employees) return [];
    
    // Get the cutoff date (e.g., 7 days ago)
    const cutoffDate = subDays(new Date(), daysThreshold);
    
    // Find unique user IDs with recent messages
    const recentUserIds = new Set<string>();
    
    messages.forEach(message => {
      const messageDate = new Date(message.created_at);
      
      // Check if message is recent
      if (isAfter(messageDate, cutoffDate)) {
        // Add the other person to the set
        const otherId = message.sender_id === currentUserId 
          ? message.recipient_id 
          : message.sender_id;
          
        recentUserIds.add(otherId);
      }
    });
    
    // Map IDs to employee objects
    return employees.filter(emp => recentUserIds.has(emp.id));
  }, [messages, currentUserId, employees, daysThreshold]);
}
