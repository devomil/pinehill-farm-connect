
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
      // Get all profiles without any filtering
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      // Even if we get 0 profiles, let's not error but return an empty array
      if (!data || data.length === 0) {
        console.log("No employee profiles found in database");
        
        // Get current user from auth to at least have one employee
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          console.log("Adding current authenticated user as fallback:", authData.user.email);
          
          // Create a basic user profile from auth data
          const fallbackUser = {
            id: authData.user.id,
            name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || "Current User",
            email: authData.user.email || "",
            role: "employee",
            department: "",
            position: ""
          };
          
          const formattedEmployees = [fallbackUser];
          setUnfilteredEmployees(formattedEmployees);
          setEmployees(formattedEmployees);
          return;
        }
        
        // If we can't even get the current user, return empty arrays
        setUnfilteredEmployees([]);
        setEmployees([]);
        return;
      }
      
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
      console.log("Employee directory loaded successfully:", formattedEmployees.length);
      
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
