
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types";

/**
 * Hook for managing employee-admin assignments
 */
export function useAssignmentManagement(employees: User[], currentUser: User | null) {
  const createTestAssignment = async () => {
    try {
      if (!currentUser) {
        toast.error("No current user found");
        return;
      }
      
      // Check if there are any employees in the system
      if (!employees || employees.length === 0) {
        console.log("No employees found in the system, creating test profile");
        
        // Create test profile if none exists
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            name: currentUser.name || 'Test User',
            email: currentUser.email || 'test@example.com'
          });
          
        if (profileError) {
          console.error("Error creating test profile:", profileError);
          toast.error("Failed to create test profile");
          return null;
        }
      }
      
      // Find any employee that is not the current user to assign to
      let employeeToAssign = employees.find(e => e.id !== currentUser.id);
      
      // If no other employee found, use self-assignment
      if (!employeeToAssign) {
        console.log("No other employees found, using self-assignment");
        employeeToAssign = currentUser;
      }
      
      // Create/update assignment - always allow assignment regardless of role
      const { data: existingAssignments, error: fetchError } = await supabase
        .from('employee_assignments')
        .select('id')
        .eq('employee_id', currentUser.id);
      
      if (fetchError) throw fetchError;
      
      const existingAssignment = existingAssignments && existingAssignments[0];
      
      if (existingAssignment) {
        toast.info(`Assignment already exists - updating to employee: ${employeeToAssign.name}`);
      }
      
      const { error } = await supabase
        .from('employee_assignments')
        .upsert({ 
          id: existingAssignment?.id || undefined,
          employee_id: currentUser.id, 
          admin_id: employeeToAssign.id
        });
        
      if (error) {
        throw error;
      }
      
      toast.success(`Successfully assigned ${currentUser.name} to employee: ${employeeToAssign.name}`);
      return employeeToAssign;
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(`Failed to create assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  return {
    createTestAssignment
  };
}
