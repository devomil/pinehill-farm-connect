
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EmployeeRolesProps {
  selectedRoles: { [key: string]: boolean };
  handleRoleChange: (role: string, checked: boolean) => void;
}

export function EmployeeRoles({ selectedRoles, handleRoleChange }: EmployeeRolesProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch 
            id="role-admin" 
            checked={selectedRoles.admin}
            onCheckedChange={(checked) => {
              handleRoleChange('admin', checked);
              // If admin is enabled, automatically set employee role to false
              if (checked) {
                handleRoleChange('employee', false);
              } else {
                // If admin is disabled, default to employee role
                handleRoleChange('employee', true);
              }
            }}
          />
          <Label htmlFor="role-admin">Admin (Full system access)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="role-employee" 
            checked={selectedRoles.employee}
            onCheckedChange={(checked) => {
              handleRoleChange('employee', checked);
              // If employee is enabled, automatically set admin role to false
              if (checked) {
                handleRoleChange('admin', false);
              } else {
                // If employee is disabled, default to admin role
                handleRoleChange('admin', true);
              }
            }}
          />
          <Label htmlFor="role-employee">Employee (Basic access)</Label>
        </div>
      </div>
    </div>
  )
}
