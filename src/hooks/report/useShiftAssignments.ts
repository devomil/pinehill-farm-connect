
import { useEffect, useState } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useShiftAssignments(employees: User[], assignments: any[], currentUser: User | null) {
  const [assignableEmployees, setAssignableEmployees] = useState<User[]>([]);

  useEffect(() => {
    if (employees && assignments) {
      const adminsAndManagers = employees.filter(e => e.role === 'admin' || e.role === 'manager');
      console.log(`Found ${adminsAndManagers.length} admins/managers for assignment`, adminsAndManagers);
      
      const assignableSet = new Set(adminsAndManagers.map(e => e.id));
      const result = [...adminsAndManagers];

      if (currentUser && assignments && assignments.length > 0) {
        console.log(`Looking for assignments for ${currentUser.id}`, assignments);
        
        const currentUserAssignment = assignments.find(a => 
          a.employee_id === currentUser.id && a.admin_id
        );
        
        if (currentUserAssignment && currentUserAssignment.admin_id) {
          console.log(`Found assignment: user ${currentUser.id} is assigned to admin ${currentUserAssignment.admin_id}`);
          
          const assignedAdmin = employees.find(e => e.id === currentUserAssignment.admin_id);
          if (assignedAdmin && !assignableSet.has(assignedAdmin.id)) {
            console.log(`Adding assigned admin to list: ${assignedAdmin.name}`);
            result.push(assignedAdmin);
            assignableSet.add(assignedAdmin.id);
          }
        } else {
          console.log(`No assigned admin found for user ${currentUser.id}`);
          
          const potentialAdmins = employees.filter(e => 
            e.name.toLowerCase().includes('ryan') && !assignableSet.has(e.id)
          );
          
          if (potentialAdmins.length > 0) {
            console.log("Adding potential admin based on name:", potentialAdmins);
            result.push(...potentialAdmins);
          }
        }
      }
      
      setAssignableEmployees(result);
    }
  }, [employees, assignments, currentUser]);

  const createTestAssignment = async () => {
    try {
      if (!currentUser) {
        toast.error("No current user found");
        return;
      }
      
      const ryan = employees.find(e => e.name.toLowerCase().includes('ryan'));
      if (!ryan) {
        toast.error("Ryan not found in employees list");
        return;
      }
      
      const existingAssignment = assignments?.find(a => a.employee_id === currentUser.id);
      if (existingAssignment) {
        toast.info("Assignment already exists - updating to Ryan");
      }
      
      const { error } = await supabase
        .from('employee_assignments')
        .upsert({ 
          id: existingAssignment?.id || undefined,
          employee_id: currentUser.id, 
          admin_id: ryan.id
        });
        
      if (error) {
        throw error;
      }
      
      toast.success(`Assigned ${currentUser.name} to Ryan Sorensen`);
      
      setAssignableEmployees(prev => {
        if (!prev.some(e => e.id === ryan.id)) {
          return [...prev, ryan];
        }
        return prev;
      });
      
    } catch (error) {
      console.error('Error creating test assignment:', error);
      toast.error(`Failed to create assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    assignableEmployees,
    createTestAssignment
  };
}
