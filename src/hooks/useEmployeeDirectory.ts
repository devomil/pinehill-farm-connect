import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useEmployeeDirectory() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [unfilteredEmployees, setUnfilteredEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Error>('');
  const { currentUser } = useAuth();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all users with their profiles
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          department,
          position,
          avatar_url,
          created_at,
          employee_id
        `)
        .order('name');

      if (fetchError) {
        console.error('Error fetching employees:', fetchError);
        const message = fetchError.message || 'Failed to load employee data';
        const details = [fetchError.details || ''].filter(Boolean);
        const timestamp = new Date().toISOString();
        
        // Create a proper Error object instead of a plain object
        const newError = new Error(message);
        (newError as any).details = details;
        (newError as any).timestamp = timestamp;
        setError(newError);
        
        return;
      }

      if (!data) {
        setEmployees([]);
        setUnfilteredEmployees([]);
        return;
      }

      // Transform the data to match our User type
      const transformedData = data.map((profile) => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name || '',
        role: profile.role || '',
        department: profile.department || '',
        position: profile.position || '',
        avatar_url: profile.avatar_url || '',
        created_at: profile.created_at || '',
        employeeId: profile.employee_id || '',
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
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Refetch function that can be called from outside
  const refetch = useCallback(() => {
    console.log('Manually refetching employee directory');
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
