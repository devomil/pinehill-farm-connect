
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
      if (!currentUser?.id) {
        throw new Error("You must be logged in to send messages");
      }

      console.log(`Attempting to send message to recipient ID: ${recipientId}`);
      
      // First check if the recipient exists in the employee directory
      try {
        // First, fetch full profile data from the database
        const { data: recipientData, error: recipientError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', recipientId);

        if (recipientError) {
          console.error("Error fetching recipient data:", recipientError);
          throw new Error(`Database error when finding recipient: ${recipientError.message}`);
        }
  
        if (!recipientData || recipientData.length === 0) {
          console.error(`No recipient found with ID: ${recipientId}`);
          throw new Error(`Recipient not found. Please refresh and try again.`);
        }
        
        // Use first matching recipient
        const recipient = recipientData[0];
        console.log("Found recipient:", recipient);

        // Get requester's admin if this is a shift coverage request
        let adminData = null;
        if (type === 'shift_coverage') {
          // Find the admin assigned to the current user (requester)
          const { data: adminAssignment, error: adminError } = await supabase
            .from('employee_assignments')
            .select('admin_id, admin:profiles!employee_assignments_admin_id_fkey(id, name, email)')
            .eq('employee_id', currentUser.id)
            .maybeSingle();

          if (!adminError && adminAssignment?.admin) {
            adminData = adminAssignment.admin;
            console.log("Found requester's admin:", adminData);
          } else {
            console.warn("No admin found for requester:", currentUser.id, adminError);
          }
        }
  
        const { data: communicationData, error: communicationError } = await supabase
          .from('employee_communications')
          .insert({
            sender_id: currentUser.id,
            recipient_id: recipientId,
            message,
            type,
            status: 'pending',
            admin_cc: adminData?.id || null // Store the admin ID for reference
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
              original_employee_id: currentUser.id,
              covering_employee_id: recipientId,
              ...shiftDetails,
              status: 'pending'
            });
  
          if (shiftError) throw shiftError;
        }
  
        // Send notification to recipient using notifyManager
        try {
          console.log(`Sending notification to ${recipient.name} (${recipient.email}) with ID: ${recipientId}`);
          
          const actionType = type === 'shift_coverage' ? 'shift_coverage_request' : 'new_message';
          
          const notifyResult = await notifyManager(
            actionType,
            {
              id: currentUser.id || "unknown",
              name: currentUser.name || "Unknown User",
              email: currentUser.email || "unknown"
            },
            {
              message,
              communicationId: communicationData.id,
              adminCc: adminData ? {
                id: adminData.id,
                name: adminData.name,
                email: adminData.email
              } : null,
              ...(shiftDetails || {})
            },
            {
              id: recipient.id,
              name: recipient.name,
              email: recipient.email
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
      } catch (error) {
        console.error("Error in send message function:", error);
        throw error;
      }
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
