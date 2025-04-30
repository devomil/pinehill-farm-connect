
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Edit, Trash2, UserRound } from "lucide-react";

interface EmployeeTableRowProps {
  employee: User;
  onEdit: (employee: User) => void;
  onDelete: (id: string) => void;
  onResetPassword?: (employee: User) => void;
  isAdmin?: boolean;
}

export function EmployeeTableRow({ 
  employee, 
  onEdit, 
  onDelete, 
  onResetPassword, 
  isAdmin 
}: EmployeeTableRowProps) {
  return (
    <TableRow key={employee.id}>
      <TableCell className="font-medium">{employee.name || 'Not Set'}</TableCell>
      <TableCell>{employee.email}</TableCell>
      <TableCell>{employee.department || 'Not Set'}</TableCell>
      <TableCell>{employee.position || 'Not Set'}</TableCell>
      <TableCell>{employee.role || 'employee'}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(employee)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          
          {isAdmin && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onResetPassword && onResetPassword(employee)}>
                <UserRound className="h-4 w-4" />
                <span className="sr-only">Reset Password</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(employee.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
