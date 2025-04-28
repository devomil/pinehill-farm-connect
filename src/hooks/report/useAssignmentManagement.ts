
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
      
      // First attempt: look for existing admin/manager users (not the current user)
      let adminToAssign = employees.find(e => 
        (e.role === 'admin' || e.role === 'manager') && 
        e.id !== currentUser.id
      );
      
      // If no admin found, check if current user is admin/manager
      if (!adminToAssign && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
        console.log("Using current user as admin (since they have admin/manager role)");
        // Special case: If current user is admin/manager, create a test user to assign to them
        const regularEmployee = employees.find(e => 
          e.role !== 'admin' && e.role !== 'manager' && e.id !== currentUser.id
        );
        
        if (regularEmployee) {
          // Switch roles - assign regular employee to current admin user
          const { error } = await supabase
            .from('employee_assignments')
            .upsert({ 
              employee_id: regularEmployee.id,
              admin_id: currentUser.id
            });
          
          if (error) throw error;
          
          toast.success(`Assigned ${regularEmployee.name} to you (${currentUser.name})`);
          return currentUser;
        }
      }
      
      // Final fallback: Create a new admin role for the current user if no other admins exist
      if (!adminToAssign) {
        console.log("No existing admin/manager found, promoting current user to admin");
        
        // Promote current user to admin
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: currentUser.id,
            role: 'admin'
          });
        
        if (roleError) {
          console.error("Error updating user role:", roleError);
          toast.error("Failed to create admin role");
          return null;
        }
        
        toast.success(`Promoted you (${currentUser.name}) to admin role`);
        adminToAssign = { ...currentUser, role: 'admin' };
        
        // No need to create an assignment if we're promoting the current user to admin
        // The user can now assign reports to themselves
        return adminToAssign;
      }
      
      // If we still don't have an admin to assign to
      if (!adminToAssign) {
        toast.error("Could not find or create an admin user to assign to");
        return null;
      }
      
      // Create/update assignment
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
