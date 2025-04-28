
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
      
      // First, look for an existing admin/manager in the system
      const adminOrManager = employees.find(e => 
        e.role === 'admin' || 
        e.role === 'manager'
      );
      
      // If no admin/manager found, create a self-assignment as fallback
      const assignToUser = adminOrManager || currentUser;
      
      if (!adminOrManager) {
        console.log("No admin or manager found, using current user as fallback");
        toast.info("No admin or manager found. Creating a self-assignment as fallback.");
      }
      
      const { data: existingAssignments, error: fetchError } = await supabase
        .from('employee_assignments')
        .select('id')
        .eq('employee_id', currentUser.id);
      
      if (fetchError) throw fetchError;
      
      const existingAssignment = existingAssignments && existingAssignments[0];
      
      if (existingAssignment) {
        toast.info(`Assignment already exists - updating to ${assignToUser.name}`);
      }
      
      const { error } = await supabase
        .from('employee_assignments')
        .upsert({ 
          id: existingAssignment?.id || undefined,
          employee_id: currentUser.id, 
          admin_id: assignToUser.id
        });
        
      if (error) {
        throw error;
      }
      
      toast.success(`Assignment created successfully for ${currentUser.name}`);
      return assignToUser;
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
