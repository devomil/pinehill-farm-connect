
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for fetching trainings data for the dashboard
 */
export function useTrainingsDashboard(
  currentUser: any | null,
  retryCount: number
) {
  // Fetch assigned trainings
  const { data: assignedTrainings, error: assignedTrainingsError, refetch: refetchTrainings } = useQuery({
    queryKey: ['assignedTrainings', currentUser?.id, retryCount],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_assignments')
        .select(`
          *,
          trainings (
            title,
            duration,
            expires_after
          )
        `)
        .eq('user_id', currentUser?.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id,
    staleTime: 30000,
    retry: 3
  });

  return {
    assignedTrainings,
    assignedTrainingsError,
    refetchTrainings
  };
}
