
import React from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Key, Eye } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

interface EmployeeTableRowProps {
  employee: User;
  onEdit: (employee: User) => void;
  onDelete: (id: string) => void;
  onResetPassword: (employee: User) => void;
  onView?: (employee: User) => void;
  isAdmin: boolean;
}

export function EmployeeTableRow({ 
  employee, 
  onEdit, 
  onDelete, 
  onResetPassword,
  onView,
  isAdmin 
}: EmployeeTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{employee.name}</span>
          {employee.employeeId && (
            <span className="text-xs text-muted-foreground">#{employee.employeeId}</span>
          )}
        </div>
      </TableCell>
      <TableCell>{employee.email}</TableCell>
      <TableCell>{employee.department || "-"}</TableCell>
      <TableCell>{employee.position || "-"}</TableCell>
      <TableCell>
        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
          employee.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {employee.role === 'admin' ? 'admin' : 'employee'}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(employee)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(employee)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(employee.id)}
                title="Delete"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onResetPassword(employee)}
                title="Reset Password"
              >
                <Key className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
