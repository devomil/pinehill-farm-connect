
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Training } from "@/types";

export const useTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("title");

      if (error) throw error;

      const mappedTrainings = (data || []).map(training => ({
        ...training,
        requiredFor: training.required_for,
        expiresAfter: training.expires_after
      })) as Training[];

      setTrainings(mappedTrainings);
    } catch (err) {
      console.error("Error fetching trainings:", err);
      toast.error("Failed to load trainings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  return {
    trainings,
    loading,
    refetchTrainings: fetchTrainings
  };
};
