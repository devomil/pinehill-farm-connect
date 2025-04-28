
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
        toast.error("No employees found in the system");
        return;
      }
      
      // Look specifically for admin users (not the current user)
      const availableAdmins = employees.filter(e => 
        (e.role === 'admin' || e.role === 'manager') && 
        e.id !== currentUser.id
      );
      
      // If no appropriate admin found, show a clear message
      if (availableAdmins.length === 0) {
        toast.error("No admin or manager found to assign to. Please add an admin user to the system.");
        return null;
      }
      
      // Select the first available admin
      const adminToAssign = availableAdmins[0];
      
      const { data: existingAssignments, error: fetchError } = await supabase
        .from('employee_assignments')
        .select('id')
        .eq('employee_id', currentUser.id);
      
      if (fetchError) throw fetchError;
      
      const existingAssignment = existingAssignments && existingAssignments[0];
      
      if (existingAssignment) {
        toast.info(`Assignment already exists - updating to admin: ${adminToAssign.name}`);
      }
      
      const { error } = await supabase
        .from('employee_assignments')
        .upsert({ 
          id: existingAssignment?.id || undefined,
          employee_id: currentUser.id, 
          admin_id: adminToAssign.id
        });
        
      if (error) {
        throw error;
      }
      
      toast.success(`Successfully assigned ${currentUser.name} to admin: ${adminToAssign.name}`);
      return adminToAssign;
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
