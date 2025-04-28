
import { useEffect, useState } from "react";
import { User } from "@/types";

/**
 * Hook for filtering employees based on assignments
 * UPDATED: All employees can see each other - no filtering by role or assignments
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
    
    // Include ALL employees regardless of role or assignments
    // This ensures every employee can see and interact with every other employee
    const result = [...employees];
    
    // If the current user is not in the list (which shouldn't happen), add them
    if (currentUser && !result.some(e => e.id === currentUser.id)) {
      console.log(`Adding current user (${currentUser.name}) to assignable list`);
      result.push(currentUser);
    }
    
    console.log(`Found ${result.length} employees for assignment/communication`);
    setAssignableEmployees(result);
  }, [employees, assignments, currentUser]);

  return {
    assignableEmployees
  };
}
