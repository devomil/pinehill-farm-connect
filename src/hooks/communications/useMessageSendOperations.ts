
import { useCallback } from "react";
import { toast } from "sonner";
import { useMessageValidation } from "./useMessageValidation";

export function useMessageSendOperations(
  sendMessageMutation: any, 
  respondToShiftRequestMutation: any,
  refreshMessages: () => Promise<any>
) {
  const { validateShiftCoverageMessage } = useMessageValidation();
  
  const sendMessage = useCallback((params: any) => {
    console.log("Sending message with params:", JSON.stringify(params, null, 2));
    
    if (params.type === 'shift_coverage' && !validateShiftCoverageMessage(params)) {
      return Promise.reject(new Error("Invalid message parameters"));
    }
    
    toast.loading("Sending message...");
    
    return sendMessageMutation.mutateAsync(params)
      .then(data => {
        console.log("Message sent successfully:", data);
        toast.dismiss();
        toast.success("Message sent successfully");
        
        // Wait a moment before refreshing to allow database operations to complete
        setTimeout(() => refreshMessages(), 500); // Reduced from 1000 to 500ms
        return data;
      })
      .catch(error => {
        console.error("Error sending message:", error);
        toast.dismiss();
        toast.error(`Failed to send message: ${error.message || "Unknown error"}`);
        throw error;
      });
  }, [sendMessageMutation, refreshMessages, validateShiftCoverageMessage]);
  
  const respondToShiftRequest = useCallback((params: any) => {
    console.log("Responding to shift request:", params);
    
    toast.loading(`${params.accept ? 'Accepting' : 'Declining'} shift request...`);
    
    return respondToShiftRequestMutation.mutateAsync(params)
      .then(data => {
        console.log("Successfully responded to shift request:", data);
        toast.dismiss();
        toast.success(`You have ${params.accept ? 'accepted' : 'declined'} the shift coverage request`);
        
        // Refresh after a short delay
        setTimeout(() => refreshMessages(), 500); // Reduced from 1000 to 500ms
        return data;
      })
      .catch(error => {
        console.error("Error responding to shift request:", error);
        toast.dismiss();
        toast.error(`Failed to respond to request: ${error.message || "Unknown error"}`);
        throw error;
      });
  }, [respondToShiftRequestMutation, refreshMessages]);

  return { sendMessage, respondToShiftRequest };
}
