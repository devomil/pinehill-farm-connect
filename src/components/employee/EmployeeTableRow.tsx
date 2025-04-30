
import React from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Key, Eye } from "lucide-react";

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
    <tr key={employee.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800">
      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        <div className="flex flex-col">
          <span>{employee.name}</span>
          <span className="text-xs text-muted-foreground">{employee.email}</span>
        </div>
      </td>
      <td className="px-6 py-4">{employee.department || "-"}</td>
      <td className="px-6 py-4">{employee.position || "-"}</td>
      <td className="px-6 py-4">
        <Badge variant={employee.role === "admin" ? "secondary" : "outline"}>
          {employee.role || "employee"}
        </Badge>
      </td>
      <td className="px-6 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(employee)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => onResetPassword(employee)}>
                  <Key className="mr-2 h-4 w-4" />
                  <span>Reset Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(employee.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
