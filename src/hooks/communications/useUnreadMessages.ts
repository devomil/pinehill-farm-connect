import { useMemo } from "react";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

export function useUnreadMessages(messages: Communication[] | null, currentUser: User | null) {
  return useMemo(() => {
    if (!messages || !currentUser) return [];
    
    // Filter messages to find unread ones directed to the current user
    const unreadMessages = messages.filter(
      message => 
        message.recipient_id === currentUser.id && 
        !message.read_at
    );
    
    // Add sender_name to each message for easier reference in UI
    return unreadMessages.map(message => {
      // If the sender_name is already set, just return the message as is
      if (message.sender_name) {
        return message;
      }
      
      // Otherwise, try to infer a name from available data
      let senderName = "Unknown";
      
      // If sender has a display_name or name property
      if (message.sender_display_name) {
        senderName = message.sender_display_name;
      } else if (message.sender_email) {
        // Try to extract a name from the email
        senderName = message.sender_email.split('@')[0] || "Unknown";
        // Capitalize first letter
        senderName = senderName.charAt(0).toUpperCase() + senderName.slice(1);
      }
      
      // Return message with added sender_name
      return {
        ...message,
        sender_name: senderName
      };
    });
  }, [messages, currentUser]);
}
