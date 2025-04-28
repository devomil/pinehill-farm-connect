
import { useEffect, useState } from "react";
import { User } from "@/types";

/**
 * Hook for filtering employees based on role and assignments
 */
export function useEmployeeFiltering(
  employees: User[],
  assignments: any[],
  currentUser: User | null
) {
  const [assignableEmployees, setAssignableEmployees] = useState<User[]>([]);

  useEffect(() => {
    if (!employees || employees.length === 0) {
      console.log("No employees available for filtering");
      if (currentUser) {
        // If no other employees but we have current user, make them assignable to themselves
        console.log("No employees but have current user - making them self-assignable");
        setAssignableEmployees([currentUser]);
      } else {
        setAssignableEmployees([]);
      }
      return;
    }
    
    // Get admins and managers from employees list, including current user if they are admin/manager
    const adminsAndManagers = employees.filter(e => 
      (e.role === 'admin' || e.role === 'manager')
    );
    
    console.log(`Found ${adminsAndManagers.length} admins/managers for assignment`, adminsAndManagers);
    
    // Start with admins/managers (even if empty)
    let result = [...adminsAndManagers];
    const assignableSet = new Set(adminsAndManagers.map(e => e.id));

    // If there are assignments, add the assigned admin to the list
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
      }
    }

    // If the current user is an admin/manager, they should see themselves in the list too
    // This allows them to assign reports to themselves
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && !assignableSet.has(currentUser.id)) {
      console.log(`Adding current user (${currentUser.role}) to assignable list`);
      result.push(currentUser);
      assignableSet.add(currentUser.id);
    }
    
    // If we still have no assignable employees, add current user as a fallback
    if (result.length === 0 && currentUser) {
      console.log("No assignable employees found - adding current user as fallback");
      result.push(currentUser);
    }
    
    setAssignableEmployees(result);
  }, [employees, assignments, currentUser]);

  return {
    assignableEmployees
  };
}
