
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Assignment {
  id: string;
  employee_id: string;
  admin_id: string;
  created_at: string;
  employee: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  admin: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export function useEmployeeAssignments() {
  const queryClient = useQueryClient();

  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['employeeAssignments'],
    queryFn: async () => {
      try {
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

        // Sort assignments by admin name then employee name
        return result.sort((a, b) => {
          // Sort by admin name first
          const adminNameA = a.admin?.name?.toLowerCase() || '';
          const adminNameB = b.admin?.name?.toLowerCase() || '';
          
          if (adminNameA !== adminNameB) {
            return adminNameA.localeCompare(adminNameB);
          }
          
          // Then sort by employee name
          const empNameA = a.employee?.name?.toLowerCase() || '';
          const empNameB = b.employee?.name?.toLowerCase() || '';
          return empNameA.localeCompare(empNameB);
        });
      } catch (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
    }
  });

  const assignEmployee = useMutation({
    mutationFn: async ({ employeeId, adminId }: { employeeId: string; adminId: string }) => {
      // Check if assignment already exists
      const { data: existing } = await supabase
        .from('employee_assignments')
        .select('id')
        .eq('employee_id', employeeId)
        .single();
        
      // Use upsert to create or update the assignment
      const { error } = await supabase
        .from('employee_assignments')
        .upsert({ 
          id: existing?.id || undefined,
          employee_id: employeeId, 
          admin_id: adminId 
        });

      if (error) throw error;
      return { employeeId, adminId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employeeAssignments'] });
      
      // Find admin name for better toast message
      const adminProfile = assignments?.find(a => a.admin?.id === data.adminId)?.admin;
      const adminName = adminProfile?.name || adminProfile?.email || 'admin';
      
      toast.success(`Employee assignment updated successfully to ${adminName}`);
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
      return employeeId;
    },
    onSuccess: (employeeId) => {
      queryClient.invalidateQueries({ queryKey: ['employeeAssignments'] });
      
      // Find employee name for better toast message
      const employeeName = assignments?.find(a => a.employee_id === employeeId)?.employee?.name || 'Employee';
      
      toast.success(`Assignment removed for ${employeeName}`);
    },
    onError: (error) => {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove employee assignment');
    }
  });

  // Add a function to get all employees assigned to a specific admin
  const getEmployeesByAdmin = (adminId: string) => {
    if (!assignments) return [];
    return assignments
      .filter(assignment => assignment.admin_id === adminId)
      .map(assignment => assignment.employee)
      .filter(Boolean);
  };
  
  // Get all admins with assigned employees
  const getAdminsWithEmployees = () => {
    if (!assignments) return [];
    
    // Get unique admin IDs
    const adminIds = [...new Set(assignments.map(a => a.admin_id))];
    
    // Create admin objects with their assigned employees
    return adminIds.map(adminId => {
      const adminAssignments = assignments.filter(a => a.admin_id === adminId);
      const adminProfile = adminAssignments[0]?.admin;
      
      return {
        admin: adminProfile,
        employees: adminAssignments.map(a => a.employee).filter(Boolean)
      };
    });
  };

  return {
    assignments,
    isLoading,
    error,
    assignEmployee,
    removeAssignment,
    getEmployeesByAdmin,
    getAdminsWithEmployees
  };
}
