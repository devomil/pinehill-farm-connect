
import { useMemo } from 'react';
import { User } from '@/types';

/**
 * A hook that returns a function to get an employee's name by their ID
 * @param employees Array of employees to search through
 * @returns A function that accepts an employee ID and returns their name
 */
export const useEmployeeName = (employees: User[]) => {
  return useMemo(() => {
    return (id: string): string => {
      const employee = employees.find(emp => emp.id === id);
      return employee?.name || 'Unknown User';
    };
  }, [employees]);
};
