
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormValues } from "../schemas/employeeFormSchema";
import { EmployeeHR } from "@/types";

type EmploymentType = "full-time" | "part-time" | "contract" | "seasonal" | "intern" | "none";

interface EmploymentFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
  handleHRDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setEmployeeHR: React.Dispatch<React.SetStateAction<EmployeeHR | null>>;
}

export function EmploymentFields({ form, handleHRDataChange, setEmployeeHR }: EmploymentFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="salary"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="salary">Salary</Label>
            <FormControl>
              <Input 
                id="salary" 
                name="salary"
                type="number"
                value={field.value?.toString() || ''}
                onChange={(e) => {
                  field.onChange(e.target.value ? Number(e.target.value) : undefined);
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
        name="employmentType"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="employmentType">Employment Type</Label>
            <FormControl>
              <Select 
                value={field.value || 'none'} 
                onValueChange={(value: EmploymentType) => {
                  field.onChange(value === 'none' ? '' : value);
                  setEmployeeHR(prev => prev ? { 
                    ...prev, 
                    employmentType: value === 'none' ? '' : value 
                  } : null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
