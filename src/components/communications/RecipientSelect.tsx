
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { User } from "@/types";
import { NewMessageFormData } from "@/types/communications";
import { AlertCircle, UserCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecipientSelectProps {
  form: UseFormReturn<NewMessageFormData>;
  employees: User[];
}

export function RecipientSelect({ form, employees }: RecipientSelectProps) {
  // Display all employees without filtering
  
  return (
    <FormField
      control={form.control}
      name="recipientId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>To</FormLabel>
          {employees.length > 0 ? (
            <>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name || employee.email} {employee.role ? `(${employee.role})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                <UserCheck className="h-3 w-3 mr-1" /> 
                All employees and admins can communicate with each other
              </div>
            </>
          ) : (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No employees found. Try clicking "Fix Assignments" in the Reports page or contact your administrator.
              </AlertDescription>
            </Alert>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
