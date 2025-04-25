
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { NewMessageFormData } from "@/types/communications";

interface ShiftDetailsFormProps {
  form: UseFormReturn<NewMessageFormData>;
}

export function ShiftDetailsForm({ form }: ShiftDetailsFormProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="shiftDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Shift Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="shiftStart"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shiftEnd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
