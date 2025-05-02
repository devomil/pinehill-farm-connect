
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorObject } from '@/utils/errorUtils';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { EmployeeDirectoryHook } from './types';
import { useFetchEmployees } from './useFetchEmployees';
import { useEmployeeModifications } from './useEmployeeModifications';
import { useRealTimeUpdates } from './useRealTimeUpdates';

export function useEmployeeDirectory(): EmployeeDirectoryHook {
  const [employees, setEmployees] = useState<User[]>([]);
  const [unfilteredEmployees, setUnfilteredEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Error | null>(null);
  const { currentUser } = useAuth();
  const { toast: uiToast } = useToast();
  
  // Import our refactored functionality
  const { 
    fetchViaEdgeFunction, 
    fetchFromDatabase,
    fetchPlaceholderEmployees,
    createDummyEmployees,
    fetchSimpleProfiles,
    filterCurrentUser
  } = useFetchEmployees(currentUser?.id);
  
  const {
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployeeModifications();

  /**
   * Main function to fetch employees from various sources
   */
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching employees from profiles table...');
      
      // First try using the edge function to get profiles (bypasses RLS)
      const edgeFunctionData = await fetchViaEdgeFunction();
      if (edgeFunctionData) {
        const filteredEmployees = filterCurrentUser(edgeFunctionData, { excludeCurrentUser: true });
        setEmployees(filteredEmployees);
        setUnfilteredEmployees(edgeFunctionData);
        setLoading(false);
        return;
      }
      
      // Fallback to direct database query
      try {
        const dbData = await fetchFromDatabase();
        if (dbData) {
          const filteredEmployees = filterCurrentUser(dbData, { excludeCurrentUser: true });
          setEmployees(filteredEmployees);
          setUnfilteredEmployees(dbData);
          setLoading(false);
          return;
        }
      } catch (dbError: any) {
        console.error('Error in direct database query:', dbError);
        setError(toErrorObject(dbError.message || 'Failed to load employee data'));
        
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

      // Try to get user roles as placeholders
      const placeholderData = await fetchPlaceholderEmployees(currentUser?.role === 'admin');
      if (placeholderData) {
        const filteredPlaceholders = filterCurrentUser(placeholderData, { excludeCurrentUser: true });
        setEmployees(filteredPlaceholders);
        setUnfilteredEmployees(placeholderData);
        setLoading(false);
        return;
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
        return;
      } else {
        setEmployees([]);
        setUnfilteredEmployees([]);
      }
    } catch (err: any) {
      console.error('Unexpected error in useEmployeeDirectory:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error fetching employees'));
      
      // Try one more time with a simple, direct approach
      try {
        const simpleData = await fetchSimpleProfiles();
        if (simpleData) {
          const filteredSimpleEmployees = filterCurrentUser(simpleData, { excludeCurrentUser: true });
          setEmployees(filteredSimpleEmployees);
          setUnfilteredEmployees(simpleData);
        } else {
          // Create dummy users if we're really desperate
          if (currentUser) {
            const dummyData = createDummyEmployees(currentUser);
            setEmployees(dummyData.filter(emp => emp.id !== currentUser.id));
            setUnfilteredEmployees(dummyData);
            toast.info("Using sample employees since we couldn't load real ones");
          }
        }
      } catch (finalErr) {
        console.error('Final attempt to fetch employees failed:', finalErr);
      }
    } finally {
      setLoading(false);
    }
  }, [
    currentUser, 
    fetchViaEdgeFunction, 
    fetchFromDatabase, 
    fetchPlaceholderEmployees, 
    filterCurrentUser,
    fetchSimpleProfiles,
    createDummyEmployees
  ]);

  // Define refetch function to be used from outside
  const refetch = useCallback(() => {
    console.log('Manually refetching employee directory');
    toast.info("Refreshing employee directory");
    return fetchEmployees();
  }, [fetchEmployees]);
  
  // Set up real-time subscription for profile changes
  useRealTimeUpdates(fetchEmployees);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    unfilteredEmployees,
    loading,
    error,
    refetch,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
}
