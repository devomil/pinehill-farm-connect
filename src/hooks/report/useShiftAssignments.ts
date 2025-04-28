
import { useEffect, useState } from "react";
import { User } from "@/types";
import { useEmployeeFiltering } from "./useEmployeeFiltering";
import { useAssignmentManagement } from "./useAssignmentManagement";

/**
 * Combines employee filtering and assignment management for shift reports
 */
export function useShiftAssignments(employees: User[], assignments: any[], currentUser: User | null) {
  // Use the extracted hooks
  const { assignableEmployees } = useEmployeeFiltering(employees, assignments, currentUser);
  const { createTestAssignment } = useAssignmentManagement(employees, currentUser);
  
  // Add update to assignable employees when a new assignment is created
  const handleCreateTestAssignment = async () => {
    const newAdmin = await createTestAssignment();
    return newAdmin;
  };

  return {
    assignableEmployees,
    createTestAssignment: handleCreateTestAssignment
  };
}
