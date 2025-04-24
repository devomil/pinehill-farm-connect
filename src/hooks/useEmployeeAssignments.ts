
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEmployeeAssignments() {
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['employeeAssignments'],
    queryFn: async () => {
      // First, get all employee assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('employee_assignments')
        .select('id, employee_id, admin_id, created_at');

      if (assignmentError) throw assignmentError;

      // Then separately fetch the profile data for each
      const result = await Promise.all((assignmentData || []).map(async (assignment) => {
        // Get employee profile
        const { data: employeeProfile, error: employeeError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', assignment.employee_id)
          .single();

        if (employeeError) console.error('Error fetching employee profile:', employeeError);

        // Get admin profile
        const { data: adminProfile, error: adminError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', assignment.admin_id)
          .single();

        if (adminError) console.error('Error fetching admin profile:', adminError);

        return {
          ...assignment,
          employee: employeeProfile || null,
          admin: adminProfile || null
        };
      }));

      return result;
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
