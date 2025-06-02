
import React from "react";
import { User } from "@/types";
import { UserTable } from "./UserTable";
import { LoadingState, ErrorState } from "@/components/ui";
import { Section } from "@/components/ui/section";

interface EmployeePageContentProps {
  filteredEmployees: User[];
  loading: boolean;
  error: string | Error | null;
  onUpdateEmployee: (id: string, updatedEmployee: any) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  onRetry: () => void;
}

export const EmployeePageContent: React.FC<EmployeePageContentProps> = ({
  filteredEmployees,
  loading,
  error,
  onUpdateEmployee,
  onDeleteEmployee,
  onRetry
}) => {
  if (loading) {
    return <LoadingState variant="table" lines={6} showHeader={true} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load employees"
        message={typeof error === "string" ? error : error.message}
        onRetry={onRetry}
        retryLabel="Reload employees"
      />
    );
  }

  return (
    <Section variant="card" title="Employee Directory">
      <UserTable
        users={filteredEmployees}
        onUpdateEmployee={onUpdateEmployee}
        onDeleteEmployee={onDeleteEmployee}
      />
    </Section>
  );
};
