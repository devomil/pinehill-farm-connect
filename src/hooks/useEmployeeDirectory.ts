
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorObject } from '@/utils/errorUtils';
import { useToast } from '@/components/ui/use-toast';

export function useEmployeeDirectory() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [unfilteredEmployees, setUnfilteredEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Error | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching employees from profiles table...');
      
      // Only select columns that actually exist in the profiles table
      // Based on the database schema from the error message
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
        return;
      }

      if (!data) {
        setEmployees([]);
        setUnfilteredEmployees([]);
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
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Add a new employee
  const addEmployee = useCallback(async (employeeData: Partial<User>) => {
    try {
      // This would typically be a server-side operation via an edge function
      // For now, just return a mock implementation
      console.log('Adding employee:', employeeData);
      toast({
        title: "Employee addition would happen here",
        description: "This is a placeholder for the actual employee creation functionality"
      });
      
      // Refetch to update the list
      await fetchEmployees();
      return { id: 'new-id' };
    } catch (err: any) {
      console.error('Error adding employee:', err);
      throw err;
    }
  }, [fetchEmployees, toast]);

  // Update an existing employee
  const updateEmployee = useCallback(async (id: string, employeeData: Partial<User>) => {
    try {
      console.log('Updating employee:', id, employeeData);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: employeeData.name,
          department: employeeData.department,
          position: employeeData.position,
          employeeId: employeeData.employeeId,
          // Add any other fields you want to update
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error in supabase update:', updateError);
        throw updateError;
      }
      
      // Refetch to update the list
      await fetchEmployees();
      return true;
    } catch (err: any) {
      console.error('Error updating employee:', err);
      throw err;
    }
  }, [fetchEmployees]);

  // Delete an employee
  const deleteEmployee = useCallback(async (id: string) => {
    try {
      // This would typically involve more complex logic with authentication and authorization
      // For now, just implement a simple version
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Refetch to update the list
      await fetchEmployees();
      return true;
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      throw err;
    }
  }, [fetchEmployees]);

  // Define refetch function to be used from outside
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
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
