
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notifyManager } from "@/utils/notifyManager";
import { RespondToShiftRequestParams } from "@/types/communications/communicationTypes";
import { User } from "@/types";

export function useRespondToShiftRequest(currentUser: User | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      communicationId, 
      shiftRequestId, 
      accept,
      senderId
    }: RespondToShiftRequestParams) => {
      const status = accept ? 'accepted' : 'declined';

      // Get sender profile information
      const { data: senderData, error: senderError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', senderId)
        .single();

      if (senderError || !senderData) {
        console.error("Error fetching sender data:", senderError);
        throw new Error("Could not find sender information");
      }

      const { error: commError } = await supabase
        .from('employee_communications')
        .update({ status })
        .eq('id', communicationId);

      if (commError) throw commError;

      const { error: shiftError } = await supabase
        .from('shift_coverage_requests')
        .update({ status })
        .eq('id', shiftRequestId);

      if (shiftError) throw shiftError;

      // Send notification about response to the original sender
      try {
        console.log(`Sending response notification to ${senderData.name} (${senderData.email})`);
        
        const notifyResult = await notifyManager(
          'shift_coverage_response',
          {
            id: currentUser?.id || "unknown",
            name: currentUser?.name || "Unknown User",
            email: currentUser?.email || "unknown"
          },
          {
            response: status,
            communicationId
          },
          {
            id: senderData.id,
            name: senderData.name,
            email: senderData.email
          }
        );

        if (!notifyResult.success) {
          console.warn("Response notification failed, but status was updated:", notifyResult.error);
          // Don't throw here, as we still updated the response status successfully
        }
      } catch (notifyError) {
        console.error("Error sending response notification:", notifyError);
        // Don't throw here as the response was still saved
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Response sent successfully');
    },
    onError: (error) => {
      console.error('Error responding to request:', error);
      toast.error(`Failed to respond to request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}
