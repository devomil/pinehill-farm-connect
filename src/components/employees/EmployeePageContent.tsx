
import React from "react";
import { User } from "@/types";
import { UserTable } from "./UserTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EmployeePageContentProps {
  filteredEmployees: User[];
  loading: boolean;
  error: string | Error | null;
  onUpdateEmployee: (id: string, updatedEmployee: any) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  onRetry: () => void;
}

export function EmployeePageContent({
  filteredEmployees,
  loading,
  error,
  onUpdateEmployee,
  onDeleteEmployee,
  onRetry
}: EmployeePageContentProps) {
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      <UserTable
        employees={filteredEmployees}
        loading={loading}
        error={error}
        onUpdate={onUpdateEmployee}
        onDelete={onDeleteEmployee}
        onRetry={onRetry}
      />
    </div>
  );
}
