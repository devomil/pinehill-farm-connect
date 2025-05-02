
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
      shiftDetails,
      adminCc
    }: SendMessageParams) => {
      if (!currentUser?.id) {
        throw new Error("You must be logged in to send messages");
      }

      console.log(`Attempting to send message to recipient ID: ${recipientId}, type: ${type}`);
      if (type === 'shift_coverage' && shiftDetails) {
        console.log("Shift coverage request details:", shiftDetails);
      }
      
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
          // If adminCc is manually set, use that ID
          if (adminCc) {
            const { data: manualAdmin, error: manualAdminError } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('id', adminCc)
              .maybeSingle();
              
            if (!manualAdminError && manualAdmin) {
              adminData = manualAdmin;
              console.log("Using specified admin CC:", adminData);
            } else {
              console.warn("Specified admin CC not found:", adminCc, manualAdminError);
            }
          } 
          
          // If no admin found yet, fall back to the employee's assigned admin
          if (!adminData) {
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
        }
  
        // Step 1: Create the communication entry
        console.log("Creating communication entry with type:", type);
        const { data: communicationData, error: communicationError } = await supabase
          .from('employee_communications')
          .insert({
            sender_id: currentUser.id,
            recipient_id: recipientId,
            message,
            type,
            status: 'pending',
            admin_cc: adminData?.id || adminCc || null // Store the admin ID for reference
          })
          .select()
          .single();
  
        if (communicationError) {
          console.error("Error creating communication:", communicationError);
          throw communicationError;
        }
        
        console.log("Created communication:", communicationData);
  
        // Step 2: If it's a shift coverage request, add the shift details
        if (type === 'shift_coverage' && shiftDetails) {
          console.log(`Creating shift coverage request for communication ${communicationData.id}`);
          
          // Ensure we have all required fields for the shift request
          if (!shiftDetails.shift_date || !shiftDetails.shift_start || !shiftDetails.shift_end) {
            console.error("Missing required shift details:", shiftDetails);
            throw new Error("Missing required shift details");
          }
          
          // Debugging the payload
          const shiftPayload = {
            communication_id: communicationData.id,
            original_employee_id: shiftDetails.original_employee_id || currentUser.id,
            covering_employee_id: shiftDetails.covering_employee_id || recipientId,
            shift_date: shiftDetails.shift_date,
            shift_start: shiftDetails.shift_start,
            shift_end: shiftDetails.shift_end,
            status: 'pending'
          };
          
          console.log("Sending shift coverage request payload:", shiftPayload);
          
          // Create the shift coverage request with explicit payload
          const { data: shiftData, error: shiftError } = await supabase
            .from('shift_coverage_requests')
            .insert(shiftPayload)
            .select();
  
          if (shiftError) {
            console.error("Error creating shift coverage request:", shiftError);
            // Even if shift request creation fails, we'll still return the communication
            // as it was created successfully
            toast.error("Created message but failed to create shift coverage request");
            throw shiftError;
          }
          
          console.log("Created shift coverage request:", shiftData);

          // Verify the request was created
          const { data: checkData, error: checkError } = await supabase
            .from('shift_coverage_requests')
            .select('*')
            .eq('communication_id', communicationData.id);

          if (checkError) {
            console.error("Error verifying shift coverage request:", checkError);
          } else {
            console.log("Verification of created shift coverage request:", checkData);
          }
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
      queryClient.invalidateQueries({ queryKey: ['shiftCoverage'] });
      console.log("Successfully sent message - invalidating queries");
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}
