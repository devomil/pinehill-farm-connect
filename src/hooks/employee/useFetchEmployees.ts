
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { FetchEmployeesOptions } from './types';
import { toast } from 'sonner';

/**
 * Hook that provides functions to fetch employees from different sources
 */
export function useFetchEmployees(currentUserId?: string) {
  
  /**
   * Fetches employee profiles via edge function
   */
  const fetchViaEdgeFunction = useCallback(async () => {
    console.log('Attempting to fetch profiles via edge function');
    
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

        return transformedData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profiles via edge function:', error);
      return null;
    }
  }, []);

  /**
   * Fetches employee profiles directly from the database
   */
  const fetchFromDatabase = useCallback(async () => {
    console.log('Fetching employees from profiles table directly');
    
    try {
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
        throw fetchError;
      }

      if (!data || data.length === 0) {
        console.log('No employee profiles found');
        return null;
      }

      console.log(`Fetched ${data.length} employee profiles from database`);
      
      // Transform the data to match our User type
      const transformedData = data.map((profile) => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name || '',
        role: 'employee', // Default role if not specified
        department: profile.department || '',
        position: profile.position || '',
        avatar_url: '', // Not in the database but required by User type
        created_at: profile.updated_at || '', // Use updated_at as a substitute
        employeeId: profile.employeeId || '',
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching from database:', error);
      throw error;
    }
  }, []);

  /**
   * Fetches user roles as placeholder employees
   */
  const fetchPlaceholderEmployees = useCallback(async (isAdmin: boolean) => {
    if (!isAdmin) return null;
    
    console.log('Attempting to fetch user roles for placeholder profiles');
    
    try {
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
        
        return placeholderProfiles;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching placeholder employees:', error);
      return null;
    }
  }, []);

  /**
   * Creates a simple array of dummy employees for fallback
   */
  const createDummyEmployees = useCallback((currentUser?: User | null) => {
    console.log('Creating dummy employee data as last resort');
    
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
    
    if (currentUser) {
      return [...dummyEmployees, {
        id: currentUser.id,
        email: currentUser.email || '',
        name: currentUser.name || '',
        role: currentUser.role || 'employee',
        department: currentUser.department || '',
        position: currentUser.position || '',
        avatar_url: '',
        created_at: '',
        employeeId: '',
      }];
    }
    
    return dummyEmployees;
  }, []);

  /**
   * Attempts a simple query to get basic profile data
   */
  const fetchSimpleProfiles = useCallback(async () => {
    try {
      console.log('Attempting simple profile query as fallback');
      const { data: simpleData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .limit(10);
        
      if (simpleData && simpleData.length > 0) {
        console.log(`Recovered ${simpleData.length} employee profiles with simple query`);
        
        return simpleData.map((profile) => ({
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
      }
      
      return null;
    } catch (error) {
      console.error('Simple profile query failed:', error);
      return null;
    }
  }, []);

  /**
   * Filter out the current user if needed
   */
  const filterCurrentUser = useCallback((employees: User[], options?: FetchEmployeesOptions) => {
    if (options?.excludeCurrentUser && currentUserId) {
      return employees.filter(emp => emp.id !== currentUserId);
    }
    return employees;
  }, [currentUserId]);

  return {
    fetchViaEdgeFunction,
    fetchFromDatabase,
    fetchPlaceholderEmployees,
    createDummyEmployees,
    fetchSimpleProfiles,
    filterCurrentUser
  };
}
