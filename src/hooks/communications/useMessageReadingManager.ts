
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMessageReadingManager() {
  const [isMarking, setIsMarking] = useState(false);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!messageId) {
      console.error("Cannot mark message as read: No messageId provided");
      return false;
    }

    setIsMarking(true);
    try {
      console.log("Marking message as read:", messageId);
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) {
        console.error("Error marking message as read:", error);
        toast.error("Could not mark message as read");
        return false;
      }

      console.log("Message marked as read successfully");
      return true;
    } catch (err) {
      console.error("Unexpected error in markMessageAsRead:", err);
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsMarking(false);
    }
  }, []);

  return { markMessageAsRead, isMarking };
}
