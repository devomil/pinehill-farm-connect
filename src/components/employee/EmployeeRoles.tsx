
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface EmployeeRolesProps {
  selectedRoles: { [key: string]: boolean };
  handleRoleChange: (role: string, checked: boolean) => void;
}

export function EmployeeRoles({ selectedRoles, handleRoleChange }: EmployeeRolesProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">User Role</h3>
        <p className="text-sm text-muted-foreground">
          Select the appropriate role for this employee. An employee can only have one primary role.
        </p>
      </div>
      <RadioGroup 
        value={selectedRoles.admin ? "admin" : "employee"} 
        onValueChange={(value) => {
          if (value === "admin") {
            handleRoleChange('admin', true);
            handleRoleChange('employee', false);
          } else {
            handleRoleChange('admin', false);
            handleRoleChange('employee', true);
          }
        }}
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
  )
}
