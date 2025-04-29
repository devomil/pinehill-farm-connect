
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Centralized hook for accessing employee directory data across the application
 */
export function useEmployeeDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching employee directory, current user:", currentUser?.email);
      
      // Create a public RLS bypass function call to fetch all profiles
      const { data: publicProfiles, error: publicProfilesError } = await supabase
        .functions.invoke('get_all_profiles');

      if (publicProfilesError) {
        console.error("Error fetching profiles with function:", publicProfilesError);
        
        // Fall back to regular profile query
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .not('email', 'is', null); // Only get valid profiles with email

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }
        
        if ((!profiles || profiles.length === 0) && currentUser) {
          // If no profiles found but we have a current user, use that as fallback
          console.log("No profiles found - using current user as fallback");
          
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
        
        // Process regular profiles
        processProfileData(profiles);
      } else {
        // Process profiles from the edge function
        console.log("Successfully fetched profiles with bypass function:", publicProfiles?.length || 0);
        processProfileData(publicProfiles);
      }
    } catch (error: any) {
      console.error("Error in useEmployeeDirectory:", error);
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
        toast.error("Failed to load employee directory");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Helper function to process profile data
  const processProfileData = async (profiles: any[]) => {
    try {
      // Fetch user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        // Continue anyway with available data
      }

      // Map roles to profiles
      const formattedEmployees: User[] = (profiles || []).map(profile => {
        // Find the role for this user
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        
        // Ensure the email is valid
        let email = profile.email || '';
        if (!email.includes('@')) {
          console.warn(`Profile ${profile.id} has invalid email: ${email}`);
          // Use a default email domain if one isn't present
          if (email && email.trim() !== '') {
            email = `${email}@pinehillfarm.co`;
          }
        }
        
        return {
          id: profile.id,
          name: profile.name || profile.email?.split('@')[0] || '',
          email: email,
          department: profile.department || '',
          position: profile.position || '',
          role: userRole?.role || 'employee'
        };
      });

      // Make sure the current user is included in the list
      if (currentUser && !formattedEmployees.some(emp => emp.id === currentUser.id)) {
        // Ensure current user has a valid email
        let currentUserEmail = currentUser.email || '';
        if (!currentUserEmail.includes('@') && currentUserEmail.trim() !== '') {
          currentUserEmail = `${currentUserEmail}@pinehillfarm.co`;
        }
        
        formattedEmployees.push({
          id: currentUser.id,
          name: currentUser.name || currentUser.email?.split('@')[0] || 'Current User',
          email: currentUserEmail,
          department: currentUser.department || '',
          position: currentUser.position || '',
          role: currentUser.role || 'employee'
        });
      }

      // Log any profiles with invalid emails as a warning
      const invalidEmails = formattedEmployees.filter(emp => !emp.email || !emp.email.includes('@'));
      if (invalidEmails.length > 0) {
        console.warn(`Found ${invalidEmails.length} employees with invalid emails:`, 
          invalidEmails.map(e => `${e.name} (${e.email})`));
      }

      setEmployees(formattedEmployees);
    } catch (err) {
      console.error("Error processing profile data:", err);
      throw err;
    }
  };

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
