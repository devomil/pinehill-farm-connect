
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEmployeeDirectory() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [unfilteredEmployees, setUnfilteredEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [fetchTryCount, setFetchTryCount] = useState<number>(0);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFetchErrors([]);
    
    try {
      console.log(`Fetching employee directory (last refresh: ${new Date(lastRefreshTime).toLocaleTimeString()}, attempt: ${fetchTryCount + 1})`);
      
      // Try multiple approaches to ensure we get employee data
      let employeeDataFetched = false;

      // Approach 1: Try edge function first (most reliable, bypasses RLS)
      try {
        console.log("Attempt 1: Fetching profiles using edge function");
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
            setFetchErrors(prev => [...prev, `User roles error: ${userRolesError.message}`]);
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
          employeeDataFetched = true;
          return;
        } else if (edgeFunctionError) {
          console.warn("Error fetching profiles with edge function:", edgeFunctionError);
          setFetchErrors(prev => [...prev, `Edge function error: ${edgeFunctionError.message || edgeFunctionError}`]);
        }
      } catch (edgeFunctionErr: any) {
        console.error("Exception in edge function approach:", edgeFunctionErr);
        setFetchErrors(prev => [...prev, `Edge function exception: ${edgeFunctionErr.message || edgeFunctionErr}`]);
      }
      
      // Approach 2: Direct profiles query as fallback
      if (!employeeDataFetched) {
        try {
          console.log("Attempt 2: Fetching profiles using direct query");
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("name", { ascending: true });

          if (error) {
            console.error("Error in direct profiles query:", error);
            setFetchErrors(prev => [...prev, `Direct query error: ${error.message}`]);
            throw error;
          }

          // Get user roles
          const { data: userRoles, error: userRolesError } = await supabase
            .from('user_roles')
            .select('*');
            
          if (userRolesError) {
            console.error("Error fetching user roles:", userRolesError);
            setFetchErrors(prev => [...prev, `User roles error: ${userRolesError.message}`]);
          }

          // Process profiles even if we get zero profiles
          if (!data || data.length === 0) {
            console.log("No profiles found via direct query");
            setFetchErrors(prev => [...prev, "No profiles found via direct query"]);
            
            // Approach 3: Get current authenticated user as fallback
            try {
              console.log("Attempt 3: Using current authenticated user as fallback");
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
                employeeDataFetched = true;
                return;
              }
            } catch (authErr: any) {
              console.error("Error fetching current user:", authErr);
              setFetchErrors(prev => [...prev, `Auth user error: ${authErr.message || authErr}`]);
            }
            
            // Last resort: Add a default dummy user if all else fails
            // This ensures the UI isn't blocked completely
            if (!employeeDataFetched) {
              console.log("Attempt 4: Using dummy user as last resort");
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
              employeeDataFetched = true;
              setFetchErrors(prev => [...prev, "Using dummy user as last resort - no real users found"]);
              return;
            }
          } else {
            console.log(`Retrieved ${data.length} employees from directory via direct query`);
            
            // Process profiles with roles
            const processedProfiles = data.map(profile => {
              const userRole = userRoles?.find(role => role.user_id === profile.id);
              return {
                ...profile,
                role: userRole?.role || 'employee'
              };
            });
            
            processProfileData(processedProfiles);
            employeeDataFetched = true;
          }
        } catch (directQueryErr: any) {
          console.error("Error in direct query approach:", directQueryErr);
          setFetchErrors(prev => [...prev, `Direct query exception: ${directQueryErr.message || directQueryErr}`]);
          
          // Approach 4: Final fallback - look for auth user
          if (!employeeDataFetched) {
            try {
              console.log("Attempt 5: Final fallback using auth user");
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
                employeeDataFetched = true;
                return;
              }
            } catch (authErr: any) {
              console.error("Final fallback error:", authErr);
              setFetchErrors(prev => [...prev, `Final fallback error: ${authErr.message || authErr}`]);
            }
          }
          
          if (!employeeDataFetched) {
            throw directQueryErr;
          }
        }
      }
      
      if (!employeeDataFetched) {
        throw new Error("All employee fetch approaches failed");
      }
    } catch (error: any) {
      console.error("All employee directory fetch approaches failed:", error);
      
      // Combine all errors into a more detailed message
      const combinedError = {
        message: `Failed to fetch employees: ${error.message || "Unknown error"}`,
        details: fetchErrors,
        timestamp: new Date().toISOString()
      };
      
      setError(combinedError);
      toast.error("Could not load employee directory");
      
      // Increment the try count for exponential backoff
      setFetchTryCount(prev => prev + 1);
      
      // Even in case of errors, we ensure there's at least a blank slate
      setUnfilteredEmployees([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [lastRefreshTime, fetchTryCount]);

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
    } catch (error: any) {
      console.error("Error processing profile data:", error);
      toast.error("Error processing employee data");
      setError(error);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Auto-retry with exponential backoff if no employees found
  useEffect(() => {
    if ((unfilteredEmployees.length === 0 || error) && fetchTryCount > 0 && fetchTryCount < 5) {
      const backoffTime = Math.min(1000 * Math.pow(2, fetchTryCount), 30000); // Cap at 30 seconds
      console.log(`Auto-retrying employee fetch in ${backoffTime/1000}s (attempt ${fetchTryCount + 1})`);
      
      const retryTimer = setTimeout(() => {
        console.log(`Executing auto-retry attempt ${fetchTryCount + 1}`);
        fetchEmployees();
      }, backoffTime);
      
      return () => clearTimeout(retryTimer);
    }
  }, [unfilteredEmployees, error, fetchTryCount, fetchEmployees]);

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
    setFetchTryCount(0); // Reset the try count for manual refresh
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
    lastRefreshTime,
    fetchErrors
  };
}
