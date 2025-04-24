
import { useState, useEffect, useCallback } from "react";
import { User as UserType } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useEmployees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if user profiles exists in the profiles table
      const { count: profileCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      console.log("Profile count:", profileCount);
      
      if (profileCount === 0) {
        console.log("No profiles found in the database");
        toast.warning("No employee profiles found. Please check database setup.");
        setEmployees([]);
        setLoading(false);
        return;
      }
      
      // Fetch profiles with proper role information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      console.log("Fetched profiles:", profiles);

      // Fetch user roles to combine with profiles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      console.log("Fetched user roles:", userRoles);

      // Map roles to profiles
      const formattedEmployees: UserType[] = (profiles || []).map(profile => {
        // Find the role for this user
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        
        return {
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          department: profile.department || '',
          position: profile.position || '',
          role: userRole?.role || 'employee'
        };
      });

      setEmployees(formattedEmployees);
      console.log("Formatted employees:", formattedEmployees);
      
      if (formattedEmployees.length === 0) {
        console.log("No employees found after formatting");
      }
      
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      setError(error.message);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
    error,
    refetch: fetchEmployees,
    unfilteredEmployees: employees,
  };
}
