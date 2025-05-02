
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
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log(`Fetching employee directory (last refresh: ${new Date(lastRefreshTime).toLocaleTimeString()})`);
      
      // Try multiple approaches to ensure we get employee data

      // Approach 1: Try edge function first (most reliable, bypasses RLS)
      try {
        const { data: edgeFunctionProfiles, error: edgeFunctionError } = await supabase
          .functions.invoke('get_all_profiles');
          
        if (!edgeFunctionError && edgeFunctionProfiles && edgeFunctionProfiles.length > 0) {
          console.log("Successfully fetched profiles using edge function:", edgeFunctionProfiles.length);
          
          // Get user roles if available
          const { data: userRoles, error: userRolesError } = await supabase
            .from('user_roles')
            .select('*');
            
          if (userRolesError) {
            console.error("Error fetching user roles:", userRolesError);
          }
          
          // Process profiles with roles
          const processedProfiles = edgeFunctionProfiles.map(profile => {
            const userRole = userRoles?.find(role => role.user_id === profile.id);
            return {
              ...profile,
              role: userRole?.role || 'employee'
            };
          });
          
          processProfileData(processedProfiles);
          setLastRefreshTime(Date.now());
          return;
        } else if (edgeFunctionError) {
          console.warn("Error fetching profiles with edge function:", edgeFunctionError);
        }
      } catch (edgeFunctionErr) {
        console.error("Exception in edge function approach:", edgeFunctionErr);
      }
      
      // Approach 2: Direct profiles query as fallback
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error in direct profiles query:", error);
          throw error;
        }

        // Get user roles
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select('*');
          
        if (userRolesError) {
          console.error("Error fetching user roles:", userRolesError);
        }

        // Process profiles even if we get zero profiles
        if (!data || data.length === 0) {
          console.log("No profiles found via direct query");
          
          // Approach 3: Get current authenticated user as fallback
          try {
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
              setLastRefreshTime(Date.now());
              setLoading(false);
              return;
            }
          } catch (authErr) {
            console.error("Error fetching current user:", authErr);
          }
          
          // Last resort: Add a default dummy user if all else fails
          // This ensures the UI isn't blocked completely
          const dummyUser = {
            id: "00000000-0000-0000-0000-000000000001",
            name: "System User",
            email: "system@example.com",
            role: "employee",
            department: "",
            position: ""
          };
          
          console.log("Using dummy user as last resort");
          setUnfilteredEmployees([dummyUser]);
          setEmployees([dummyUser]);
          setLastRefreshTime(Date.now());
          setLoading(false);
          return;
        }
        
        console.log(`Retrieved ${data.length} employees from directory`);
        
        // Process profiles with roles
        const processedProfiles = data.map(profile => {
          const userRole = userRoles?.find(role => role.user_id === profile.id);
          return {
            ...profile,
            role: userRole?.role || 'employee'
          };
        });
        
        processProfileData(processedProfiles);
        
      } catch (directQueryErr) {
        console.error("Error in direct query approach:", directQueryErr);
        
        // Approach 4: Final fallback - look for auth user
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            const fallbackUser = {
              id: authData.user.id,
              name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || "Current User",
              email: authData.user.email || "",
              role: "employee",
              department: "",
              position: ""
            };
            
            setUnfilteredEmployees([fallbackUser]);
            setEmployees([fallbackUser]);
            setLastRefreshTime(Date.now());
            setLoading(false);
            return;
          }
        } catch (authErr) {
          console.error("Final fallback error:", authErr);
        }
        
        throw directQueryErr;
      }
      
    } catch (error: any) {
      console.error("All employee directory fetch approaches failed:", error);
      setError(error.message || "Failed to fetch employees");
      toast.error("Could not load employee directory");
      
      // Even in case of errors, we ensure there's at least a blank slate
      setUnfilteredEmployees([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [lastRefreshTime]);

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
      
      // Log the first few employees for debugging
      if (formattedEmployees.length > 0) {
        console.log("Sample employees:", formattedEmployees.slice(0, 3));
      }
    } catch (error) {
      console.error("Error processing profile data:", error);
      toast.error("Error processing employee data");
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Filter employees based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setEmployees(unfilteredEmployees);
      return;
    }

    const filtered = unfilteredEmployees.filter((employee) => {
      const query = searchQuery.toLowerCase();
      return (
        (employee.name?.toLowerCase() || "").includes(query) ||
        (employee.email?.toLowerCase() || "").includes(query) ||
        (employee.department?.toLowerCase() || "").includes(query) ||
        (employee.position?.toLowerCase() || "").includes(query)
      );
    });

    setEmployees(filtered);
  }, [searchQuery, unfilteredEmployees]);

  const refetch = useCallback(() => {
    console.log("Manually refreshing employee directory");
    toast.info("Refreshing employee directory...");
    setLastRefreshTime(Date.now()); // This will trigger fetchEmployees via dependency
    return fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    unfilteredEmployees,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refetch,
    lastRefreshTime
  };
}
