
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface EmployeeRolesProps {
  selectedRoles: { [key: string]: boolean };
  handleRoleChange: (role: string, checked: boolean) => void;
  employee?: User | null;
}

export function EmployeeRoles({ selectedRoles, handleRoleChange, employee }: EmployeeRolesProps) {
  const { currentUser } = useAuth();
  const isCurrentUser = employee && currentUser && employee.id === currentUser.id;
  
  // Function to handle radio selection
  const handleRadioChange = (value: string) => {
    if (value === "admin") {
      handleRoleChange('admin', true);
      handleRoleChange('employee', false);
    } else {
      handleRoleChange('admin', false);
      handleRoleChange('employee', true);
    }
  };
  
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">User Role</h3>
          {employee && (
            <Badge variant={selectedRoles.admin ? "secondary" : "outline"}>
              {selectedRoles.admin ? "Admin" : "Employee"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Select the appropriate role for this employee. An employee can only have one primary role.
          {isCurrentUser && (
            <span className="block mt-1 text-amber-600">
              Note: Changing your own role may affect your access to certain features.
            </span>
          )}
        </p>
      </div>
      
      <RadioGroup 
        value={selectedRoles.admin ? "admin" : "employee"} 
        onValueChange={handleRadioChange}
        className="space-y-3"
      >
        <div className="flex items-start space-x-2">
          <RadioGroupItem id="role-employee" value="employee" />
          <div className="grid gap-1 leading-none">
            <Label htmlFor="role-employee" className="text-sm font-medium">
              Employee (Basic access)
            </Label>
            <p className="text-sm text-muted-foreground">
              General employee access to view announcements, submit shift reports, and manage personal information.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <RadioGroupItem id="role-admin" value="admin" />
          <div className="grid gap-1 leading-none">
            <Label htmlFor="role-admin" className="text-sm font-medium">
              Admin (Full system access)
            </Label>
            <p className="text-sm text-muted-foreground">
              Full administrative access to manage all employees, create announcements, and control system settings.
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
