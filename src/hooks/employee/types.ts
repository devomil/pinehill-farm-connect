
import { User } from '@/types';

export interface EmployeeDirectoryState {
  employees: User[];
  unfilteredEmployees: User[];
  loading: boolean;
  error: string | Error | null;
}

export interface EmployeeDirectoryHook extends EmployeeDirectoryState {
  refetch: () => Promise<void>;
  addEmployee: (newEmployee: Partial<User>) => Promise<any>;
  updateEmployee: (id: string, updates: Partial<User>) => Promise<any>;
  deleteEmployee: (id: string) => Promise<boolean>;
}

export interface FetchEmployeesOptions {
  excludeCurrentUser?: boolean;
}
