
import React from "react";
import { User } from "@/types";
import { EmployeePageContent } from "./EmployeePageContent";

interface EmployeeListProps {
  filteredEmployees: User[];
  loading: boolean;
  error: string | Error | null;
  onUpdateEmployee: (id: string, updatedEmployee: any) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  onEditEmployee: (employee: User) => void;
  onRetry: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  filteredEmployees,
  loading,
  error,
  onUpdateEmployee,
  onDeleteEmployee,
  onEditEmployee,
  onRetry
}) => {
  return (
    <EmployeePageContent
      filteredEmployees={filteredEmployees}
      loading={loading}
      error={error}
      onUpdateEmployee={onUpdateEmployee}
      onDeleteEmployee={onDeleteEmployee}
      onRetry={onRetry}
    />
  );
};
