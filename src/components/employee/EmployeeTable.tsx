
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User as UserType } from "@/types";
import { EmployeeTableRow } from "./EmployeeTableRow";

interface EmployeeTableProps {
  employees: UserType[];
  loading: boolean;
  onEdit: (employee: UserType) => void;
  onDelete: (id: string) => void;
  onResetPassword?: (employee: UserType) => void;
  isAdmin?: boolean;
}

export function EmployeeTable({ employees, loading, onEdit, onDelete, onResetPassword, isAdmin }: EmployeeTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Loading employees...
              </TableCell>
            </TableRow>
          ) : employees.length > 0 ? (
            employees.map((employee) => (
              <EmployeeTableRow
                key={employee.id}
                employee={employee}
                onEdit={onEdit}
                onDelete={onDelete}
                onResetPassword={onResetPassword}
                isAdmin={isAdmin}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No employees found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
