import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

interface EmployeeCommunicationsResult {
  employees: User[];
  filteredEmployees: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useEmployeeCommunications = (
  allEmployees: User[] | null,
  messages: Communication[] | null
): EmployeeCommunicationsResult => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);

  useEffect(() => {
    if (!allEmployees) {
      setFilteredEmployees([]);
      return;
    }

    // Filter out the current user from the list of employees
    const otherEmployees = allEmployees.filter(emp => emp.id !== currentUser?.id);

    // Filter employees based on search query
    const filtered = otherEmployees.filter((employee) => {
      const employeeName = employee.name || "";
      return employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setFilteredEmployees(filtered);
  }, [allEmployees, searchQuery, currentUser]);

  return {
    employees: allEmployees || [],
    filteredEmployees,
    searchQuery,
    setSearchQuery,
  };
};

