
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";

interface EmployeeBasicInfoProps {
  employeeData: User;
  handleBasicInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function EmployeeBasicInfo({ employeeData, handleBasicInfoChange }: EmployeeBasicInfoProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            name="name"
            value={employeeData.name || ''} 
            onChange={handleBasicInfoChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            value={employeeData.email || ''} 
            onChange={handleBasicInfoChange} 
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input 
            id="department" 
            name="department"
            value={employeeData.department || ''} 
            onChange={handleBasicInfoChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input 
            id="position" 
            name="position"
            value={employeeData.position || ''} 
            onChange={handleBasicInfoChange} 
          />
        </div>
      </div>
    </div>
  )
}
