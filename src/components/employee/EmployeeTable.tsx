
import React from "react";
import { User } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { EmployeeTableRow } from "./EmployeeTableRow";

interface EmployeeTableProps {
  employees: User[];
  loading: boolean;
  onEdit: (employee: User) => void;
  onDelete: (id: string) => void;
  onResetPassword: (employee: User) => void;
  onView?: (employee: User) => void;
  isAdmin: boolean;
}

export function EmployeeTable({ 
  employees, 
  loading, 
  onEdit, 
  onDelete, 
  onResetPassword,
  onView,
  isAdmin
}: EmployeeTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No employees found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <EmployeeTableRow 
              key={employee.id}
              employee={employee}
              onEdit={onEdit}
              onDelete={onDelete}
              onResetPassword={onResetPassword}
              onView={onView}
              isAdmin={isAdmin}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
