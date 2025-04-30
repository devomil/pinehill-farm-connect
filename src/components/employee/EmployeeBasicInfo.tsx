
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormValues } from "./schemas/employeeFormSchema";

interface EmployeeBasicInfoProps {
  employeeData: User;
  handleBasicInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeBasicInfo({ employeeData, handleBasicInfoChange, form }: EmployeeBasicInfoProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="name">Full Name</Label>
              <FormControl>
                <Input 
                  id="name" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleBasicInfoChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            value={employeeData.email || ''} 
            onChange={handleBasicInfoChange} 
            disabled
          />
        </div>
        
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="employeeId">Employee ID</Label>
              <FormControl>
                <Input 
                  id="employeeId" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleBasicInfoChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="department">Department</Label>
              <FormControl>
                <Input 
                  id="department" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleBasicInfoChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="position">Position</Label>
              <FormControl>
                <Input 
                  id="position" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleBasicInfoChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
