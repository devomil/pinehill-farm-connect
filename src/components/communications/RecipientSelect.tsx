
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { User } from "@/types";
import { NewMessageFormData } from "@/types/communications";

interface RecipientSelectProps {
  form: UseFormReturn<NewMessageFormData>;
  employees: User[];
}

export function RecipientSelect({ form, employees }: RecipientSelectProps) {
  return (
    <FormField
      control={form.control}
      name="recipientId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>To</FormLabel>
          <Select onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
