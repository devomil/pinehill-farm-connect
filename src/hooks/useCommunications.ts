
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

      return communicationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const respondToShiftRequest = useMutation({
    mutationFn: async ({ 
      communicationId, 
      shiftRequestId, 
      accept 
    }: { 
      communicationId: string; 
      shiftRequestId: string; 
      accept: boolean 
    }) => {
      const status = accept ? 'accepted' : 'declined';

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success('Response sent successfully');
    },
    onError: () => {
      toast.error('Failed to respond to request');
    }
  });

  return {
    messages,
    isLoading,
    sendMessage,
    respondToShiftRequest
  };
}
