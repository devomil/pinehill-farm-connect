
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { NewMessageFormData } from "@/types/communications";

interface ShiftDetailsFormProps {
  shiftDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  onShiftDateChange?: (date: string) => void;
  onShiftStartChange?: (time: string) => void;
  onShiftEndChange?: (time: string) => void;
  form?: UseFormReturn<NewMessageFormData>;
}

export function ShiftDetailsForm({ 
  shiftDate, 
  shiftStart, 
  shiftEnd,
  onShiftDateChange,
  onShiftStartChange,
  onShiftEndChange,
  form
}: ShiftDetailsFormProps) {
  // If using form integration
  if (form) {
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
              <FormMessage />
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
                <FormMessage />
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }

  // Direct props usage
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="shift-date">Shift Date</Label>
        <Input 
          id="shift-date" 
          type="date" 
          value={shiftDate} 
          onChange={(e) => onShiftDateChange?.(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="shift-start">Start Time</Label>
          <Input 
            id="shift-start" 
            type="time" 
            value={shiftStart} 
            onChange={(e) => onShiftStartChange?.(e.target.value)} 
          />
        </div>

        <div>
          <Label htmlFor="shift-end">End Time</Label>
          <Input 
            id="shift-end" 
            type="time" 
            value={shiftEnd} 
            onChange={(e) => onShiftEndChange?.(e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
}
