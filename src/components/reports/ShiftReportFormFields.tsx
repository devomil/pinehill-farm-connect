
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/useShiftReportForm";
import { AlertCircle, UserCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShiftReportFormFieldsProps {
  form: UseFormReturn<FormValues>;
  assignableEmployees: User[];
}

export function ShiftReportFormFields({ form, assignableEmployees }: ShiftReportFormFieldsProps) {
  console.log("Rendering form fields with assignable employees:", assignableEmployees?.length || 0);
  
  return (
    <>
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Shift Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter your shift notes here..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assign To</FormLabel>
            {assignableEmployees && assignableEmployees.length > 0 ? (
              <>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee to assign (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assignableEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name || employee.email} {employee.role ? `(${employee.role})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <UserCheck className="h-3 w-3 mr-1" /> 
                  All employees and admins can be assigned reports
                </div>
              </>
            ) : (
              <Alert variant="default" className="border-orange-500 bg-orange-50 text-orange-900">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription>
                  No employees found. Please try refreshing the page or click "Fix Assignments" button below.
                </AlertDescription>
              </Alert>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
