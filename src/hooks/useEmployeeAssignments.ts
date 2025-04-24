
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEmployeeAssignments() {
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['employeeAssignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_assignments')
        .select(`
          *,
          employee:employee_id (
            id,
            name,
            email
          ),
          admin:admin_id (
            id,
            name,
            email
          )
        `);

      if (error) throw error;
      return data;
    }
  });

  const assignEmployee = useMutation({
    mutationFn: async ({ employeeId, adminId }: { employeeId: string; adminId: string }) => {
      const { error } = await supabase
        .from('employee_assignments')
        .upsert({ employee_id: employeeId, admin_id: adminId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeAssignments'] });
      toast.success('Employee assignment updated successfully');
    },
    onError: (error) => {
      console.error('Error assigning employee:', error);
      toast.error('Failed to update employee assignment');
    }
  });

  const removeAssignment = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase
        .from('employee_assignments')
        .delete()
        .eq('employee_id', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeAssignments'] });
      toast.success('Employee assignment removed');
    },
    onError: (error) => {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove employee assignment');
    }
  });

  return {
    assignments,
    isLoading,
    assignEmployee,
    removeAssignment
  };
}
