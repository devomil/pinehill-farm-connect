
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
          id,
          employee_id,
          admin_id,
          created_at,
          profiles!employee_id(id, name, email),
          admin_profiles:profiles!admin_id(id, name, email)
        `);

      if (error) throw error;
      
      // Transform the data to match expected format
      return data?.map(item => ({
        ...item,
        employee: item.profiles,
        admin: item.admin_profiles
      }));
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
