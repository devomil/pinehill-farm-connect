
import { useState, useEffect, useCallback } from "react";
import { User as UserType } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useEmployees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching employees, current user:", currentUser?.email);
      
      // Fetch all profiles without using the .is() method with non-boolean value
      // Instead, use .not() with 'null' which is better supported by TypeScript
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('email', 'is', null); // Only get valid profiles with email

      if (profilesError) {
        // If we get an RLS error, use an alternative approach
        console.error("Error fetching profiles:", profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      console.log("Fetched profiles:", profiles?.length || 0);
      
      if ((!profiles || profiles.length === 0) && currentUser) {
        // If no profiles found but we have a current user, use that as fallback
        console.log("No profiles found - using current user as fallback");
        
        // Create a minimal list with just the current user
        setEmployees([{
          id: currentUser.id,
          name: currentUser.name || currentUser.email?.split('@')[0] || 'Current User',
          email: currentUser.email || '',
          department: currentUser.department || '',
          position: currentUser.position || '',
          role: currentUser.role || 'employee'
        }]);
        
        setLoading(false);
        return;
      }

      // Fetch user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        // Continue anyway with available data
      }

      // Map roles to profiles
      const formattedEmployees: UserType[] = (profiles || []).map(profile => {
        // Find the role for this user
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        
        return {
          id: profile.id,
          name: profile.name || profile.email?.split('@')[0] || '',
          email: profile.email || '',
          department: profile.department || '',
          position: profile.position || '',
          role: userRole?.role || 'employee'
        };
      });

      // Make sure the current user is included in the list
      if (currentUser && !formattedEmployees.some(emp => emp.id === currentUser.id)) {
        formattedEmployees.push({
          id: currentUser.id,
          name: currentUser.name || currentUser.email?.split('@')[0] || 'Current User',
          email: currentUser.email || '',
          department: currentUser.department || '',
          position: currentUser.position || '',
          role: currentUser.role || 'employee'
        });
      }

      setEmployees(formattedEmployees);
    } catch (error: any) {
      console.error("Error in useEmployees:", error);
      setError(error.message);
      
      // Even if there's an error, if we have the current user, use it as a fallback
      if (currentUser) {
        console.log("Error occurred but using current user as fallback");
        setEmployees([{
          id: currentUser.id,
          name: currentUser.name || currentUser.email?.split('@')[0] || 'Current User',
          email: currentUser.email || '',
          department: currentUser.department || '',
          position: currentUser.position || '',
          role: currentUser.role || 'employee'
        }]);
      } else {
        toast.error("Failed to load employees");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter((employee) =>
    employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
