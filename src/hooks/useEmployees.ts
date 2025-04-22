
import { useState, useEffect } from "react";
import { User as UserType } from "@/types";
import { toast } from "sonner";

export function useEmployees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Demo data; replace with API call as needed
      const mockEmployees: UserType[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@pinehillfarm.co",
          role: "employee",
          department: "Sales",
          position: "Associate"
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@pinehillfarm.co",
          role: "employee",
          department: "Production",
          position: "Team Lead"
        },
        {
          id: "3",
          name: "Robert Johnson",
          email: "robert@pinehillfarm.co",
          role: "admin",
          department: "Management",
          position: "Operations Manager"
        },
        {
          id: "4",
          name: "Sarah Williams",
          email: "sarah@pinehillfarm.co",
          role: "employee",
          department: "Customer Service",
          position: "Representative"
        }
      ];
      setEmployees(mockEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return {
    searchQuery,
    setSearchQuery,
    employees: filteredEmployees,
    loading,
    refetch: fetchEmployees,
    unfilteredEmployees: employees,
  };
}
