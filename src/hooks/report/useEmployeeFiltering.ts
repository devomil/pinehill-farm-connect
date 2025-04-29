
import { useEffect, useState } from "react";
import { User } from "@/types";

/**
 * Hook for filtering employees based on assignments
 * Updated: All employees can see each other - no filtering by role or assignments
 * Further updated: Added debugging and improved fallback measures
 */
export function useEmployeeFiltering(
  employees: User[],
  assignments: any[],
  currentUser: User | null
) {
  const [assignableEmployees, setAssignableEmployees] = useState<User[]>([]);

  useEffect(() => {
    // Always log the current state of data for debugging
    console.log(`useEmployeeFiltering called with ${employees?.length || 0} employees and ${assignments?.length || 0} assignments`);
    console.log("Current user:", currentUser);
    
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
    
    // Include ALL employees without any filtering
    console.log(`Found ${employees.length} employees - including ALL without filtering`);
    
    // Make a copy of all employees array to avoid mutation
    const result = [...employees];
    
    // If the current user is not in the list, add them
    if (currentUser && !result.some(e => e.id === currentUser.id)) {
      console.log(`Adding current user (${currentUser.name}) to assignable list`);
      result.push(currentUser);
    }
    
    console.log(`Final assignable employees count: ${result.length}`);
    console.log("Final assignable employees:", result);
    setAssignableEmployees(result);
  }, [employees, assignments, currentUser]);

  return {
    assignableEmployees
  };
}
