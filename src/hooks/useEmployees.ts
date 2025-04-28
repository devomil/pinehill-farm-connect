
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
      
      // First check if user profiles exists in the profiles table
      const { count: profileCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      console.log("Profile count:", profileCount);
      
      // If we have a current user but no profiles, create a profile for the current user
      if (profileCount === 0 && currentUser) {
        console.log("No profiles found - creating profile for current user:", currentUser);
        
        // Create profile for current user
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            department: currentUser.department || '',
            position: currentUser.position || ''
          });
          
        if (createError) {
          console.error("Error creating profile:", createError);
          // Continue with the current user as fallback even if profile creation fails
        } else {
          console.log("Created profile for current user");
          
          // Check if the user has a role, if not set a default role
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();
            
          if (!existingRole) {
            console.log("No role found for current user, creating default role");
            
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: currentUser.id,
                role: 'employee'
              });
              
            if (roleError) {
              console.error("Error creating user role:", roleError);
            }
          }
        }
      }
      
      // Fetch all profiles regardless of previous steps - NO FILTERING BY CURRENT USER
      // This ensures all employees can see each other
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

      // If still no employees after all attempts but we have current user, use that
      if (formattedEmployees.length === 0 && currentUser) {
        console.log("No employees found after all attempts - using current user as fallback");
        setEmployees([currentUser]);
      } else {
        setEmployees(formattedEmployees);
        console.log("Formatted employees:", formattedEmployees);
      }
      
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      setError(error.message);
      
      // Even if there's an error, if we have the current user, use it as a fallback
      if (currentUser) {
        console.log("Error occurred but using current user as fallback");
        setEmployees([currentUser]);
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
