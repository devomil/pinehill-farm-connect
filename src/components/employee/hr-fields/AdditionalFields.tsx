
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormValues } from "../schemas/employeeFormSchema";

interface AdditionalFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
  handleHRDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function AdditionalFields({ form, handleHRDataChange }: AdditionalFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <Label htmlFor="address">Address</Label>
            <FormControl>
              <Input 
                id="address" 
                {...field}
                onChange={(e) => {
                  field.onChange(e);
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
        name="notes"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <FormControl>
              <Textarea 
                id="notes" 
                {...field}
                rows={3}
                onChange={(e) => {
                  field.onChange(e);
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
