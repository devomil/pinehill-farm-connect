
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormValues } from "../schemas/employeeFormSchema";
import { EmployeeHR } from "@/types";

interface DateFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
  handleHRDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function DateFields({ form, handleHRDataChange }: DateFieldsProps) {
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 10);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="startDate">Start Date</Label>
            <FormControl>
              <Input 
                id="startDate" 
                name="startDate"
                type="date"
                value={field.value ? formatDateForInput(field.value) : ''}
                onChange={(e) => {
                  field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                  handleHRDataChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="endDate"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="endDate">End Date</Label>
            <FormControl>
              <Input 
                id="endDate" 
                name="endDate"
                type="date"
                value={field.value ? formatDateForInput(field.value) : ''}
                onChange={(e) => {
                  field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                  handleHRDataChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
