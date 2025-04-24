
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserType } from "@/types";
import { EmployeeSearchBar } from "./EmployeeSearchBar";
import { EmployeeTable } from "./EmployeeTable";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DatabaseIcon } from "lucide-react";

interface EmployeeContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  employees: UserType[];
  loading: boolean;
  onEdit: (employee: UserType) => void;
  onDelete: (id: string) => void;
  onResetPassword: (employee: UserType) => void;
  isAdmin: boolean;
  error?: string | null;
}

export function EmployeeContent({
  searchQuery,
  setSearchQuery,
  employees,
  loading,
  onEdit,
  onDelete,
  onResetPassword,
  isAdmin,
  error,
}: EmployeeContentProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Employees Directory</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <DatabaseIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!loading && employees.length === 0 && !error && (
          <Alert className="mb-4">
            <DatabaseIcon className="h-4 w-4" />
            <AlertTitle>No Employees Found</AlertTitle>
            <AlertDescription>
              There are no employee profiles in the database. If you're an administrator, 
              try adding employee profiles.
            </AlertDescription>
          </Alert>
        )}
        
        <EmployeeSearchBar value={searchQuery} onChange={setSearchQuery} />
        <EmployeeTable
          employees={employees}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
          onResetPassword={onResetPassword}
          isAdmin={isAdmin}
        />
      </CardContent>
    </Card>
  );
}
