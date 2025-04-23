
import React from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  requiredForAll: z.boolean().default(true),
  requiredForRetail: z.boolean().default(false),
  requiredForOperations: z.boolean().default(false),
  requiredForManagement: z.boolean().default(false),
});

interface RequiredDepartmentsSectionProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  onRequiredForAllChange: (value: boolean) => void;
  onSpecificDepartmentChange: () => void;
}

export const RequiredDepartmentsSection: React.FC<RequiredDepartmentsSectionProps> = ({
  form,
  onRequiredForAllChange,
  onSpecificDepartmentChange,
}) => {
  return (
    <div className="space-y-2">
      <FormLabel>Required For</FormLabel>
      
      <FormField
        control={form.control}
        name="requiredForAll"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
            <Checkbox 
              checked={field.value} 
              onCheckedChange={(value) => onRequiredForAllChange(value as boolean)} 
            />
            <FormLabel className="font-normal">All Employees</FormLabel>
          </FormItem>
        )}
      />

      {!form.watch("requiredForAll") && (
        <div className="pl-6 space-y-2">
          <FormField
            control={form.control}
            name="requiredForRetail"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={(value) => {
                    field.onChange(value);
                    onSpecificDepartmentChange();
                  }} 
                />
                <FormLabel className="font-normal">Retail</FormLabel>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="requiredForOperations"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={(value) => {
                    field.onChange(value);
                    onSpecificDepartmentChange();
                  }} 
                />
                <FormLabel className="font-normal">Operations</FormLabel>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="requiredForManagement"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={(value) => {
                    field.onChange(value);
                    onSpecificDepartmentChange();
                  }} 
                />
                <FormLabel className="font-normal">Management</FormLabel>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
