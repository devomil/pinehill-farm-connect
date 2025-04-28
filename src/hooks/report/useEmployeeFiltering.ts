
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
    
    // By default, all employees should be available for assignment
    // We're removing the role-based filtering to allow all employees to see and message each other
    const result = [...employees];
    
    // If the current user is not in the list (which shouldn't happen), add them
    if (currentUser && !result.some(e => e.id === currentUser.id)) {
      console.log(`Adding current user (${currentUser.name}) to assignable list`);
      result.push(currentUser);
    }
    
    console.log(`Found ${result.length} employees for assignment`);
    setAssignableEmployees(result);
  }, [employees, assignments, currentUser]);

  return {
    assignableEmployees
  };
}
