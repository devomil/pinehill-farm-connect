
// This file is now just a re-export to maintain backward compatibility
import { useEmployeeDirectory as useEmployeeDirectoryImpl } from './employee/useEmployeeDirectory';

export function useEmployeeDirectory() {
  return useEmployeeDirectoryImpl();
}
