
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { notifyManager } from "@/utils/notifyManager";

interface Communication {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  type: 'general' | 'shift_coverage';
  created_at: string;
  status: 'pending' | 'accepted' | 'declined';
  read_at: string | null;
}

interface ShiftCoverageRequest {
  id: string;
  communication_id: string;
  original_employee_id: string;
  covering_employee_id: string;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  status: 'pending' | 'accepted' | 'declined';
}

export function useCommunications() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['communications', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_communications')
        .select(`
          *,
          shift_coverage_requests(*)
        `)
        .or(`sender_id.eq.${currentUser?.id},recipient_id.eq.${currentUser?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ 
      recipientId, 
      message, 
      type,
      shiftDetails 
    }: { 
      recipientId: string; 
      message: string; 
      type: 'general' | 'shift_coverage';
      shiftDetails?: Omit<ShiftCoverageRequest, 'id' | 'communication_id' | 'status'>;
    }) => {
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', recipientId)
        .single();

      if (recipientError || !recipientData) {
        console.error("Error fetching recipient data:", recipientError);
        throw new Error("Could not find recipient information");
      }

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

  const respondToShiftRequest = useMutation({
    mutationFn: async ({ 
      communicationId, 
      shiftRequestId, 
      accept,
      senderId
    }: { 
      communicationId: string; 
      shiftRequestId: string; 
      accept: boolean;
      senderId: string;
    }) => {
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

  return {
    messages,
    isLoading,
    sendMessage,
    respondToShiftRequest
  };
}
