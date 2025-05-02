
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SendMessageParams } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { sendMessageService } from "./services/messageSendingService";

/**
 * Hook for sending messages with proper error handling and cache invalidation
 */
export function useSendMessage(currentUser: User | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      return await sendMessageService(currentUser, params);
    },
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
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
