
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
      
      // First check if user profiles exists in the profiles table
      const { count: profileCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Error counting profiles:", countError);
        throw countError;
      }
      
      console.log("Profile count:", profileCount);
      
      // If we have a current user but no profiles, create a profile for the current user
      // This might fail due to RLS policies
      if ((profileCount === 0 || !profileCount) && currentUser) {
        console.log("No profiles found - creating profile for current user:", currentUser);
        
        try {
          // Try to create profile for current user
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();
            
          if (checkError) {
            console.error("Error checking existing profile:", checkError);
          }
            
          if (!existingProfile) {
            // Create profile for current user
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: currentUser.id,
                name: currentUser.name || currentUser.email.split('@')[0],
                email: currentUser.email,
                department: currentUser.department || '',
                position: currentUser.position || ''
              });
              
            if (createError) {
              console.error("Error creating profile:", createError);
              // We'll continue anyway and try to use available data
            } else {
              console.log("Created profile for current user");
            }
          } else {
            console.log("Profile already exists for current user");
          }
          
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
            } else {
              console.log("Created default role for user");
            }
          }
        } catch (insertError) {
          console.error("Error in profile creation process:", insertError);
          // Continue to next steps - we'll handle with fallbacks
        }
      }
      
      // Fetch all profiles - ALWAYS fetch all profiles regardless of role
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles?.length);

      // If still no profiles but we have current user, create a profile on the fly
      if ((!profiles || profiles.length === 0) && currentUser) {
        console.log("Still no profiles found - using current user as fallback");
        setEmployees([currentUser]);
        setLoading(false);
        return;
      }

      // Fetch user roles to combine with profiles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        throw rolesError;
      }

      console.log("Fetched user roles:", userRoles?.length);

      // Map roles to profiles - include ALL profiles regardless of role
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

      // If still no employees after all attempts but we have current user, use that
      if (formattedEmployees.length === 0 && currentUser) {
        console.log("No employees found after all attempts - using current user as fallback");
        setEmployees([currentUser]);
      } else {
        setEmployees(formattedEmployees);
        console.log("Formatted employees:", formattedEmployees.length);
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
