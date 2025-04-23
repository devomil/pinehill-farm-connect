
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserType } from "@/types";
import { EmployeeSearchBar } from "./EmployeeSearchBar";
import { EmployeeTable } from "./EmployeeTable";

interface EmployeeContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  employees: UserType[];
  loading: boolean;
  onEdit: (employee: UserType) => void;
  onDelete: (id: string) => void;
  onResetPassword: (employee: UserType) => void;
  isAdmin: boolean;
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
}: EmployeeContentProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Employees Directory</CardTitle>
      </CardHeader>
      <CardContent>
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
