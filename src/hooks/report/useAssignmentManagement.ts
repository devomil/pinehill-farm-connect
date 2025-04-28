
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
      
      // Find an admin or manager user to assign (instead of specifically looking for Ryan)
      const adminOrManager = employees.find(e => 
        e.role === 'admin' || 
        e.role === 'manager' ||
        e.name.toLowerCase().includes('ryan')
      );
      
      if (!adminOrManager) {
        toast.error("No admin or manager found in the system. Please add an admin user first.");
        return;
      }
      
      const { data: existingAssignments, error: fetchError } = await supabase
        .from('employee_assignments')
        .select('id')
        .eq('employee_id', currentUser.id);
      
      if (fetchError) throw fetchError;
      
      const existingAssignment = existingAssignments && existingAssignments[0];
      
      if (existingAssignment) {
        toast.info(`Assignment already exists - updating to ${adminOrManager.name}`);
      }
      
      const { error } = await supabase
        .from('employee_assignments')
        .upsert({ 
          id: existingAssignment?.id || undefined,
          employee_id: currentUser.id, 
          admin_id: adminOrManager.id
        });
        
      if (error) {
        throw error;
      }
      
      toast.success(`Assigned ${currentUser.name} to ${adminOrManager.name}`);
      return adminOrManager;
    } catch (error) {
      console.error('Error creating test assignment:', error);
      toast.error(`Failed to create assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  return {
    createTestAssignment
  };
}
