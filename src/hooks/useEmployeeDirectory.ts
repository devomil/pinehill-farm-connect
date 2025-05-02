
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorObject } from '@/utils/errorUtils';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

export function useEmployeeDirectory() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [unfilteredEmployees, setUnfilteredEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Error | null>(null);
  const { currentUser } = useAuth();
  const { toast: uiToast } = useToast();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching employees from profiles table...');
      
      // First try using the edge function to get profiles (bypasses RLS)
      try {
        const { data: profiles, error: funcError } = await supabase
          .functions.invoke('get_all_profiles');
          
        if (!funcError && profiles && profiles.length > 0) {
          console.log(`Successfully fetched ${profiles.length} profiles via edge function`);
          
          // Transform the data to match our User type
          const transformedData = profiles.map((profile: any) => ({
            id: profile.id,
            email: profile.email || '',
            name: profile.name || profile.email?.split('@')[0] || '',
            role: profile.role || 'employee',
            department: profile.department || '',
            position: profile.position || '',
            avatar_url: profile.avatar_url || '',
            created_at: profile.created_at || '',
            employeeId: profile.employeeId || '',
          }));

          // Filter out the current user from the employees list
          const filteredEmployees = transformedData.filter(
            (emp) => emp.id !== currentUser?.id
          );

          setEmployees(filteredEmployees);
          setUnfilteredEmployees(transformedData);
          setLoading(false);
          return;
        }
      } catch (edgeFuncError) {
        console.error('Error fetching profiles via edge function:', edgeFuncError);
        // Continue to fallback method
      }
      
      // Fallback to direct query if edge function fails
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          department,
          position,
          updated_at,
          employeeId
        `)
        .order('name');

      if (fetchError) {
        console.error('Error fetching employees:', fetchError);
        const message = fetchError.message || 'Failed to load employee data';
        setError(toErrorObject(message));
        
        // If we have a current user, add them as a fallback
        if (currentUser) {
          console.log('Using current user as fallback');
          const fallbackEmployee = {
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.name || currentUser.email?.split('@')[0] || 'Current User',
            role: currentUser.role || 'employee',
            department: currentUser.department || '',
            position: currentUser.position || '',
            avatar_url: '',
            created_at: '',
            employeeId: '',
          };
          
          setUnfilteredEmployees([fallbackEmployee]);
          setEmployees([]);
        }
        
        return;
      }

      if (!data || data.length === 0) {
        console.log('No employee profiles found, checking if there are any users');
        
        // If no profiles found, try to get users directly (admins only)
        if (currentUser?.role === 'admin') {
          const { data: userData, error: userError } = await supabase
            .from('user_roles')
            .select(`
              user_id,
              role
            `)
            .limit(10);
            
          if (!userError && userData && userData.length > 0) {
            console.log(`Found ${userData.length} user roles, creating placeholder profiles`);
            
            // Create placeholder profiles for users
            const placeholderProfiles = userData.map((user) => ({
              id: user.user_id,
              email: `user-${user.user_id.substring(0, 8)}@placeholder.com`,
              name: `User ${user.user_id.substring(0, 6)}`,
              role: user.role || 'employee',
              department: '',
              position: '',
              avatar_url: '',
              created_at: '',
              employeeId: '',
            }));
            
            // Filter out current user
            const filteredProfiles = placeholderProfiles.filter(
              (emp) => emp.id !== currentUser?.id
            );
            
            setEmployees(filteredProfiles);
            setUnfilteredEmployees(placeholderProfiles);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to just the current user if available
        if (currentUser) {
          const currentUserProfile = {
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.name || currentUser.email?.split('@')[0] || 'Current User',
            role: currentUser.role || 'employee',
            department: currentUser.department || '',
            position: currentUser.position || '',
            avatar_url: '',
            created_at: '',
            employeeId: '',
          };
          
          setUnfilteredEmployees([currentUserProfile]);
          setEmployees([]);
        } else {
          setEmployees([]);
          setUnfilteredEmployees([]);
        }
        
        return;
      }

      console.log(`Fetched ${data.length} employee profiles`);
      
      // Transform the data to match our User type
      const transformedData = data.map((profile) => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name || '',
        role: 'employee', // Default role if not specified
        department: profile.department || '',
        position: profile.position || '',
        avatar_url: '', // Not in the database but required by User type
        created_at: profile.updated_at || '', // Use updated_at as a substitute since created_at doesn't exist
        employeeId: profile.employeeId || '',
      }));

      // Filter out the current user from the employees list
      const filteredEmployees = transformedData.filter(
        (emp) => emp.id !== currentUser?.id
      );

      setEmployees(filteredEmployees);
      setUnfilteredEmployees(transformedData);
    } catch (err: any) {
      console.error('Unexpected error in useEmployeeDirectory:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error fetching employees'));
      
      // Try one more time with a simple, direct approach
      try {
        const { data: simpleData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .limit(10);
          
        if (simpleData && simpleData.length > 0) {
          console.log(`Recovered ${simpleData.length} employee profiles with simple query`);
          
          const simplifiedEmployees = simpleData.map((profile) => ({
            id: profile.id,
            email: profile.email || '',
            name: profile.name || profile.email || `Employee ${profile.id.substring(0, 6)}`,
            role: 'employee',
            department: '',
            position: '',
            avatar_url: '',
            created_at: '',
            employeeId: '',
          }));
          
          // Filter out current user
          const filteredSimpleEmployees = simplifiedEmployees.filter(
            (emp) => emp.id !== currentUser?.id
          );
          
          setEmployees(filteredSimpleEmployees);
          setUnfilteredEmployees(simplifiedEmployees);
        }
      } catch (finalErr) {
        console.error('Final attempt to fetch employees failed:', finalErr);
        
        // Create dummy users if we're really desperate
        if (currentUser) {
          const dummyEmployees = [
            {
              id: 'dummy-1',
              email: 'employee1@pinehillfarm.co',
              name: 'Employee One',
              role: 'employee',
              department: 'Sales',
              position: 'Associate',
              avatar_url: '',
              created_at: '',
              employeeId: '001',
            },
            {
              id: 'dummy-2',
              email: 'employee2@pinehillfarm.co',
              name: 'Employee Two',
              role: 'employee',
              department: 'Marketing',
              position: 'Specialist',
              avatar_url: '',
              created_at: '',
              employeeId: '002',
            }
          ];
          
          setEmployees(dummyEmployees);
          setUnfilteredEmployees([...dummyEmployees, {
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.name || '',
            role: currentUser.role || 'employee',
            department: currentUser.department || '',
            position: currentUser.position || '',
            avatar_url: '',
            created_at: '',
            employeeId: '',
          }]);
          
          toast.info("Using sample employees since we couldn't load real ones");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Define refetch function to be used from outside
  const refetch = useCallback(() => {
    console.log('Manually refetching employee directory');
    toast.info("Refreshing employee directory");
    return fetchEmployees();
  }, [fetchEmployees]);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Set up real-time subscription for profile changes
  useEffect(() => {
    const channel = supabase
      .channel('employee-directory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('Profile changes detected, refreshing employee directory');
        fetchEmployees();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEmployees]);

  return {
    employees,
    unfilteredEmployees,
    loading,
    error,
    refetch,
  };
}
