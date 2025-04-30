
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeHR } from "@/types";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormValues } from "./schemas/employeeFormSchema";

interface EmployeeHRDataProps {
  employeeHR: EmployeeHR | null;
  handleHRDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setEmployeeHR: React.Dispatch<React.SetStateAction<EmployeeHR | null>>;
  form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeHRData({ employeeHR, handleHRDataChange, setEmployeeHR, form }: EmployeeHRDataProps) {
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 10);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="startDate">Start Date</Label>
              <FormControl>
                <Input 
                  id="startDate" 
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
          name="salary"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="salary">Salary</Label>
              <FormControl>
                <Input 
                  id="salary" 
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
                  value={field.value || ''} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setEmployeeHR(prev => prev ? { ...prev, employmentType: value } : null);
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
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
      </div>
    </div>
  )
}
