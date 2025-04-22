
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { User as UserType } from "@/types";

interface EmployeeTableRowProps {
  employee: UserType;
  onEdit: (employee: UserType) => void;
  onDelete: (id: string) => void;
}

export function EmployeeTableRow({ employee, onEdit, onDelete }: EmployeeTableRowProps) {
  return (
    <tr>
      <td className="font-medium">{employee.name}</td>
      <td>{employee.email}</td>
      <td>{employee.department}</td>
      <td>{employee.position}</td>
      <td>
        <span className={`px-2 py-1 rounded-full text-xs ${
          employee.role === "admin" ? "bg-purple-100 text-purple-800" : 
          employee.role === "hr" ? "bg-green-100 text-green-800" :
          employee.role === "manager" ? "bg-amber-100 text-amber-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {employee.role}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(employee)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(employee.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
