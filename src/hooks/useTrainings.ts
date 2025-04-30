
import { supabase } from '@/integrations/supabase/client';
import { Training, TrainingProgress } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useTrainings = (userId?: string) => {
  const fetchTrainings = async (): Promise<Training[]> => {
    const { data, error } = await supabase
      .from('trainings')
      .select('*');
      
    if (error) {
      console.error('Error fetching trainings:', error);
      throw new Error(error.message);
    }

    // Transform and type cast the data to match the Training interface
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      category: item.category as "CBD101" | "HIPAA" | "SaltGenerator" | "OpeningClosing" | "Other",
      duration: item.duration,
      requiredFor: item.required_for || [],
      expiresAfter: item.expires_after,
      hasQuiz: item.has_quiz || false,
      attachments: Array.isArray(item.attachments) 
        ? item.attachments.map((a: any) => ({
            name: a.name || '',
            type: a.type || '',
            url: a.url || ''
          }))
        : [],
      external_test_url: item.external_test_url || ''
    }));
  };

  const fetchUserProgress = async (userId: string): Promise<TrainingProgress[]> => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('training_progress')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user training progress:', error);
      throw new Error(error.message);
    }
    
    // Transform the data to match the TrainingProgress interface
    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      trainingId: item.training_id,
      startedAt: new Date(item.started_at),
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      score: item.score,
      passed: item.passed,
      lastAttempt: item.last_attempt ? new Date(item.last_attempt) : undefined,
      status: item.status as "not-started" | "in-progress" | "completed" | "failed" | "expired"
    }));
  };

  // Query for all trainings
  const trainingsQuery = useQuery({
    queryKey: ['trainings'],
    queryFn: fetchTrainings
  });

  // Query for user progress if userId is provided
  const userProgressQuery = useQuery({
    queryKey: ['training-progress', userId],
    queryFn: () => userId ? fetchUserProgress(userId) : Promise.resolve([]),
    enabled: !!userId
  });

  return {
    trainings: trainingsQuery.data || [],
    isLoading: trainingsQuery.isLoading,
    error: trainingsQuery.error,
    userProgress: userProgressQuery.data || [],
    isUserProgressLoading: userProgressQuery.isLoading,
    userProgressError: userProgressQuery.error,
    refetch: trainingsQuery.refetch
  };
};
