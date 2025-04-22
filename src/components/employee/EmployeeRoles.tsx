
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EmployeeRolesProps {
  selectedRoles: { [key: string]: boolean };
  handleRoleChange: (role: string, checked: boolean) => void;
}

export function EmployeeRoles({ selectedRoles, handleRoleChange }: EmployeeRolesProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="role-admin" 
            checked={selectedRoles.admin}
            onCheckedChange={(checked) => handleRoleChange('admin', !!checked)}
          />
          <Label htmlFor="role-admin">Admin (Full system access)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="role-hr" 
            checked={selectedRoles.hr}
            onCheckedChange={(checked) => handleRoleChange('hr', !!checked)}
          />
          <Label htmlFor="role-hr">HR (Access to employee data and HR functions)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="role-manager" 
            checked={selectedRoles.manager}
            onCheckedChange={(checked) => handleRoleChange('manager', !!checked)}
          />
          <Label htmlFor="role-manager">Manager (Can view employee data)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="role-employee" 
            checked={selectedRoles.employee}
            onCheckedChange={(checked) => handleRoleChange('employee', !!checked)}
          />
          <Label htmlFor="role-employee">Employee (Basic access)</Label>
        </div>
      </div>
    </div>
  )
}
