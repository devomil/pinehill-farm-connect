
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormValues } from "../schemas/employeeFormSchema";

interface ContactFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
  handleHRDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function ContactFields({ form, handleHRDataChange }: ContactFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="phone">Phone</Label>
            <FormControl>
              <Input 
                id="phone" 
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
        name="emergencyContact"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <FormControl>
              <Input 
                id="emergencyContact" 
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
    </>
  );
}
