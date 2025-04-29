
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notifyManager } from "@/utils/notifyManager";
import { SendMessageParams } from "@/types/communications/communicationTypes";
import { User } from "@/types";

export function useSendMessage(currentUser: User | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      recipientId, 
      message, 
      type,
      shiftDetails 
    }: SendMessageParams) => {
      // Use maybeSingle instead of single to prevent an error if no recipient is found
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', recipientId)
        .maybeSingle();

      if (recipientError) {
        console.error("Error fetching recipient data:", recipientError);
        throw new Error("Database error when finding recipient");
      }
      
      if (!recipientData) {
        console.error("No recipient found with ID:", recipientId);
        throw new Error("Could not find recipient information");
      }

      console.log("Found recipient:", recipientData);

      const { data: communicationData, error: communicationError } = await supabase
        .from('employee_communications')
        .insert({
          sender_id: currentUser?.id,
          recipient_id: recipientId,
          message,
          type
        })
        .select()
        .single();

      if (communicationError) throw communicationError;

      // If it's a shift coverage request, add the shift details
      if (type === 'shift_coverage' && shiftDetails) {
        const { error: shiftError } = await supabase
          .from('shift_coverage_requests')
          .insert({
            communication_id: communicationData.id,
            original_employee_id: currentUser?.id,
            covering_employee_id: recipientId,
            ...shiftDetails
          });

        if (shiftError) throw shiftError;
      }

      // Send notification to recipient using notifyManager
      try {
        console.log(`Sending notification to ${recipientData.name} (${recipientData.email}) with ID: ${recipientId}`);
        
        const actionType = type === 'shift_coverage' ? 'shift_coverage_request' : 'new_message';
        
        const notifyResult = await notifyManager(
          actionType,
          {
            id: currentUser?.id || "unknown",
            name: currentUser?.name || "Unknown User",
            email: currentUser?.email || "unknown"
          },
          {
            message,
            communicationId: communicationData.id,
            ...(shiftDetails || {})
          },
          {
            id: recipientData.id,
            name: recipientData.name,
            email: recipientData.email
          }
        );

        if (!notifyResult.success) {
          console.warn("Notification sending failed, but message was saved:", notifyResult.error);
          // Don't throw here, as we still created the communication successfully
        }
      } catch (notifyError) {
        console.error("Error sending notification:", notifyError);
        // Don't throw here as the message was still saved
      }

      return communicationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}
