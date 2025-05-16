
import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Add caching and debouncing mechanisms
  const lastFetchTime = useRef<number>(0);
  const isFetchInProgress = useRef<boolean>(false);
  const cachedEmployees = useRef<User[] | null>(null);
  const fetchDebounceTimer = useRef<number | null>(null);
  const FETCH_COOLDOWN = 60000; // 1 minute between fetches
  const fetchAttemptCount = useRef<number>(0);
  const MAX_FETCH_ATTEMPTS = 5;

  /**
   * Main function to fetch employees from various sources, with improved caching
   */
  const fetchEmployees = useCallback(async (force: boolean = false) => {
    // Don't fetch if one is already in progress
    if (isFetchInProgress.current) {
      console.log('Employee directory fetch already in progress, skipping');
      return;
    }
    
    // Check fetch attempt count
    if (fetchAttemptCount.current >= MAX_FETCH_ATTEMPTS) {
      console.log(`Reached maximum fetch attempts (${MAX_FETCH_ATTEMPTS}), using cached data`);
      if (cachedEmployees.current) {
        setEmployees(filterCurrentUser(cachedEmployees.current, { excludeCurrentUser: true }));
        setUnfilteredEmployees(cachedEmployees.current);
      }
      return;
    }
    
    // If not forced and we fetched recently, use cache
    const now = Date.now();
    if (!force && cachedEmployees.current && (now - lastFetchTime.current < FETCH_COOLDOWN)) {
      console.log(`Using cached employee data, last fetch was ${Math.round((now - lastFetchTime.current)/1000)}s ago`);
      setEmployees(filterCurrentUser(cachedEmployees.current, { excludeCurrentUser: true }));
      setUnfilteredEmployees(cachedEmployees.current);
      return;
    }
    
    // Proceed with fetch
    try {
      isFetchInProgress.current = true;
      setLoading(true);
      setError(null);
      fetchAttemptCount.current++;

      console.log(`Fetching employees from profiles table (attempt ${fetchAttemptCount.current}/${MAX_FETCH_ATTEMPTS})`);
      
      // First try using the edge function to get profiles (bypasses RLS)
      const edgeFunctionData = await fetchViaEdgeFunction();
      if (edgeFunctionData) {
        const filteredEmployees = filterCurrentUser(edgeFunctionData, { excludeCurrentUser: true });
        setEmployees(filteredEmployees);
        setUnfilteredEmployees(edgeFunctionData);
        cachedEmployees.current = edgeFunctionData;
        lastFetchTime.current = Date.now();
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
          cachedEmployees.current = dbData;
          lastFetchTime.current = Date.now();
          setLoading(false);
          return;
        }
      } catch (dbError: any) {
        console.error('Error in direct database query:', dbError);
        setError(toErrorObject(dbError.message || 'Failed to load employee data'));
        
        // If we have a current user and cached data, use cached data as fallback
        if (currentUser && cachedEmployees.current) {
          console.log('Using cached data as fallback after error');
          setEmployees(filterCurrentUser(cachedEmployees.current, { excludeCurrentUser: true }));
          setUnfilteredEmployees(cachedEmployees.current);
          setLoading(false);
          return;
        } else if (currentUser) {
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
        cachedEmployees.current = placeholderData;
        lastFetchTime.current = Date.now();
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
          cachedEmployees.current = simpleData;
          lastFetchTime.current = Date.now();
        } else {
          // Create dummy users if we're really desperate
          if (currentUser) {
            const dummyData = createDummyEmployees(currentUser);
            setEmployees(dummyData.filter(emp => emp.id !== currentUser.id));
            setUnfilteredEmployees(dummyData);
            cachedEmployees.current = dummyData;
            lastFetchTime.current = Date.now();
            toast.info("Using sample employees since we couldn't load real ones");
          }
        }
      } catch (finalErr) {
        console.error('Final attempt to fetch employees failed:', finalErr);
      }
    } finally {
      setLoading(false);
      isFetchInProgress.current = false;
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

  // Define refetch function to be used from outside, with debouncing
  const refetch = useCallback(() => {
    console.log('Manual refetch of employee directory requested');
    
    // Clear any existing debounce timer
    if (fetchDebounceTimer.current !== null) {
      clearTimeout(fetchDebounceTimer.current);
      fetchDebounceTimer.current = null;
    }
    
    // If we fetched very recently, debounce this request
    const now = Date.now();
    if (now - lastFetchTime.current < 10000) { // 10 seconds threshold
      console.log(`Debouncing employee directory refetch, last fetch was ${Math.round((now - lastFetchTime.current)/1000)}s ago`);
      
      // Only show the toast for the first request within the debounce period
      if (!fetchDebounceTimer.current) {
        toast.info("Refreshing employee directory");
      }
      
      // Set up debounced refetch
      return new Promise<void>((resolve) => {
        fetchDebounceTimer.current = window.setTimeout(() => {
          console.log("Executing debounced employee directory refetch");
          fetchEmployees(true).then(() => resolve());
        }, 10000 - (now - lastFetchTime.current)) as unknown as number;
      });
    }
    
    // If it's been long enough, fetch immediately
    toast.info("Refreshing employee directory");
    return fetchEmployees(true);
  }, [fetchEmployees]);
  
  // Set up real-time subscription for profile changes - with throttling built in
  useRealTimeUpdates(fetchEmployees);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
    
    return () => {
      // Clean up any pending debounce timer
      if (fetchDebounceTimer.current !== null) {
        clearTimeout(fetchDebounceTimer.current);
        fetchDebounceTimer.current = null;
      }
    };
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
