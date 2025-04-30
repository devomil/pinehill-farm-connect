
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { User } from "@/types";
import { NewMessageFormData } from "@/types/communications";
import { useAuth } from "@/contexts/AuthContext";

interface RecipientSelectProps {
  form: UseFormReturn<NewMessageFormData>;
  employees: User[];
}

export function RecipientSelect({ form, employees }: RecipientSelectProps) {
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Reset the recipient if the currently selected one is removed from the list
    const currentRecipientId = form.getValues("recipientId");
    if (currentRecipientId && !employees.some(e => e.id === currentRecipientId)) {
      form.setValue("recipientId", "");
      console.log("Previously selected recipient is no longer available, resetting selection");
    }
  }, [employees, form]);

  // Filter out the current user from the employee list
  const availableRecipients = currentUser ? employees.filter(employee => 
    employee.id !== currentUser.id
  ) : employees;

  // Add logging to check available recipients
  console.log(`Available recipients: ${availableRecipients.length}`, 
    availableRecipients.map(r => ({ id: r.id, name: r.name })));

  // Check if we have any valid recipients
  const hasRecipients = availableRecipients.length > 0;

  return (
    <FormField
      control={form.control}
      name="recipientId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Recipient</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={!hasRecipients}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={hasRecipients ? "Select recipient" : "No recipients available"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {hasRecipients ? (
                availableRecipients.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-recipient" disabled>
                  No recipients available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
