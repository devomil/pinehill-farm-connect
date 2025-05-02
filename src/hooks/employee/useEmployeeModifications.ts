
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';

/**
 * Hook for employee CRUD operations
 */
export function useEmployeeModifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | Error | null>(null);

  /**
   * Add a new employee to the system
   */
  const addEmployee = useCallback(async (newEmployee: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create auth user first if this is a complete new user
      if (newEmployee.email) {
        // In a real implementation, you would call an edge function to create a user
        // For demonstration, we'll just simulate adding directly to profiles
        
        // Generate a UUID for the new employee
        const newEmployeeId = crypto.randomUUID();
        
        const { data, error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: newEmployeeId, // Add the required ID field
            name: newEmployee.name || '',
            email: newEmployee.email || '',
            department: newEmployee.department || '',
            position: newEmployee.position || '',
            employeeId: newEmployee.employeeId || '',
          })
          .select();

        if (insertError) throw insertError;
        
        return data;
      }
    } catch (err: any) {
      console.error('Error adding employee:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error adding employee'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing employee's information
   */
  const updateEmployee = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          department: updates.department,
          position: updates.position,
          employeeId: updates.employeeId,
          email: updates.email,
        })
        .eq('id', id)
        .select();

      if (updateError) throw updateError;
      
      return data;
    } catch (err: any) {
      console.error('Error updating employee:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error updating employee'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an employee from the system
   */
  const deleteEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you might want to use an edge function to handle this
      // as it may involve multiple operations (auth user deletion, profile deletion, etc.)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      return true;
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error deleting employee'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addEmployee,
    updateEmployee,
    deleteEmployee,
    loading,
    error
  };
}
