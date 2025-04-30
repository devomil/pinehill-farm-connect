
import React from "react";
import { User } from "@/types";
import { EmployeeTableRow } from "./EmployeeTableRow";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800">
          <tr>
            <th scope="col" className="px-6 py-3">Employee</th>
            <th scope="col" className="px-6 py-3">Department</th>
            <th scope="col" className="px-6 py-3">Position</th>
            <th scope="col" className="px-6 py-3">Role</th>
            <th scope="col" className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
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
        </tbody>
      </table>
    </div>
  );
}
