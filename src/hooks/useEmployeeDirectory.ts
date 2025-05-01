
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
      // First try to get all profiles using the edge function that bypasses RLS
      const { data: edgeFunctionProfiles, error: edgeFunctionError } = await supabase
        .functions.invoke('get_all_profiles');
        
      if (!edgeFunctionError && edgeFunctionProfiles && edgeFunctionProfiles.length > 0) {
        console.log("Successfully fetched profiles using edge function:", edgeFunctionProfiles.length);
        
        // Get user roles
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select('*');
          
        if (userRolesError) {
          console.error("Error fetching user roles:", userRolesError);
        }
        
        // Process profiles with roles
        const processedProfiles = edgeFunctionProfiles.map(profile => {
          // Find user roles for this profile
          const userRole = userRoles?.find(role => role.user_id === profile.id);
          return {
            ...profile,
            role: userRole?.role || 'employee' // Default to 'employee' if no role found
          };
        });
        
        processProfileData(processedProfiles);
        return;
      } else if (edgeFunctionError) {
        console.warn("Error fetching profiles with edge function, falling back to direct query:", edgeFunctionError);
      }
      
      // Fallback to direct profiles query if edge function fails
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      // Get user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (userRolesError) {
        console.error("Error fetching user roles:", userRolesError);
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
      
      // Process profiles with roles
      const processedProfiles = data.map(profile => {
        // Find user roles for this profile
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'employee' // Default to 'employee' if no role found
        };
      });
      
      processProfileData(processedProfiles);
      
    } catch (error: any) {
      console.error("Error fetching employee directory:", error);
      setError(error.message || "Failed to fetch employees");
      toast.error("Could not load employee directory");
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to process profile data
  const processProfileData = (profiles: any[]) => {
    try {
      const formattedEmployees = profiles.map((employee: any) => ({
        id: employee.id,
        name: employee.name || "Unknown",
        email: employee.email || "",
        role: employee.role || "employee",
        department: employee.department || "",
        position: employee.position || "",
        employeeId: employee.employeeId || "",
      }));
      
      setUnfilteredEmployees(formattedEmployees);
      setEmployees(formattedEmployees);
      console.log("Employee directory loaded successfully:", formattedEmployees.length);
    } catch (error) {
      console.error("Error processing profile data:", error);
      toast.error("Error processing employee data");
    }
  };

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
