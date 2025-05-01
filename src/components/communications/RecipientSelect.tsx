
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { NewMessageFormData } from "@/types/communications";

// Combined props interface to support both direct usage and form usage
interface RecipientSelectProps {
  employees: User[];
  value?: string;
  onChange?: (value: string) => void;
  form?: UseFormReturn<NewMessageFormData>;
  onRefresh?: () => void;
}

export function RecipientSelect({ employees, value, onChange, form, onRefresh }: RecipientSelectProps) {
  // Check if we have any valid recipients
  const hasRecipients = employees.length > 0;

  // If using form integration
  if (form) {
    return (
      <FormField
        control={form.control}
        name="recipientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Employee</FormLabel>
            <FormControl>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
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
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Direct props usage
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
