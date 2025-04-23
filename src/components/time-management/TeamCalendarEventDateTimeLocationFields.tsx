
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface TeamCalendarEventDateTimeLocationFieldsProps {
  form: UseFormReturn<any>;
}

export const TeamCalendarEventDateTimeLocationFields: React.FC<TeamCalendarEventDateTimeLocationFieldsProps> = ({
  form
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value.toISOString().split("T")[0]}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value.toISOString().split("T")[0]}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Conference Room B" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
