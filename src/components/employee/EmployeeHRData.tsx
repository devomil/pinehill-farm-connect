
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeHR } from "@/types";

interface EmployeeHRDataProps {
  employeeHR: EmployeeHR | null;
  handleHRDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setEmployeeHR: React.Dispatch<React.SetStateAction<EmployeeHR | null>>;
}

export function EmployeeHRData({ employeeHR, handleHRDataChange, setEmployeeHR }: EmployeeHRDataProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input 
            id="startDate" 
            name="startDate"
            type="date"
            value={employeeHR?.startDate ? new Date(employeeHR.startDate).toISOString().slice(0, 10) : ''} 
            onChange={handleHRDataChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input 
            id="endDate" 
            name="endDate"
            type="date"
            value={employeeHR?.endDate ? new Date(employeeHR.endDate).toISOString().slice(0, 10) : ''} 
            onChange={handleHRDataChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input 
            id="salary" 
            name="salary"
            type="number"
            value={employeeHR?.salary || ''} 
            onChange={handleHRDataChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment Type</Label>
          <Select 
            value={employeeHR?.employmentType || ''} 
            onValueChange={(value) => 
              setEmployeeHR(prev => prev ? { ...prev, employmentType: value } : null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            name="phone"
            value={employeeHR?.phone || ''} 
            onChange={handleHRDataChange} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input 
            id="emergencyContact" 
            name="emergencyContact"
            value={employeeHR?.emergencyContact || ''} 
            onChange={handleHRDataChange} 
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input 
            id="address" 
            name="address"
            value={employeeHR?.address || ''} 
            onChange={handleHRDataChange} 
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea 
            id="notes" 
            name="notes"
            value={employeeHR?.notes || ''} 
            onChange={handleHRDataChange} 
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
