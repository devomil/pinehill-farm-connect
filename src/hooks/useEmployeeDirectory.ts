
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEmployeeDirectory() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [unfilteredEmployees, setUnfilteredEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        throw error;
      }

      if (data) {
        console.log(`Retrieved ${data.length} employees from directory`);
        const formattedEmployees = data.map((employee: any) => ({
          id: employee.id,
          name: employee.name || "Unknown",
          email: employee.email || "",
          role: employee.role || "employee",
          department: employee.department || "",
          position: employee.position || "",
        }));
        
        setUnfilteredEmployees(formattedEmployees);
        setEmployees(formattedEmployees);
      }
    } catch (error: any) {
      console.error("Error fetching employee directory:", error);
      setError(error.message || "Failed to fetch employees");
      toast.error("Could not load employee directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setEmployees(unfilteredEmployees);
      return;
    }

    const filtered = unfilteredEmployees.filter((employee) => {
      const query = searchQuery.toLowerCase();
      return (
        employee.name?.toLowerCase().includes(query) ||
        employee.email?.toLowerCase().includes(query) ||
        employee.department?.toLowerCase().includes(query) ||
        employee.position?.toLowerCase().includes(query)
      );
    });

    setEmployees(filtered);
  }, [searchQuery, unfilteredEmployees]);

  const refetch = useCallback(async () => {
    await fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    unfilteredEmployees,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refetch,
  };
}
