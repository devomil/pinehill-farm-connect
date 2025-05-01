
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types";
import { Label } from "@/components/ui/label";

interface RecipientSelectProps {
  employees: User[];
  value: string;
  onChange: (value: string) => void;
}

export function RecipientSelect({ employees, value, onChange }: RecipientSelectProps) {
  // Check if we have any valid recipients
  const hasRecipients = employees.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="recipient">Select Employee</Label>
      <Select 
        onValueChange={onChange} 
        value={value}
        disabled={!hasRecipients}
      >
        <SelectTrigger>
          <SelectValue placeholder={hasRecipients ? "Select recipient" : "No recipients available"} />
        </SelectTrigger>
        <SelectContent>
          {hasRecipients ? (
            employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name || employee.email}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-recipient" disabled>
              No recipients available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
