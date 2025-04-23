
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { TeamCalendarEventDateTimeLocationFields } from "./TeamCalendarEventDateTimeLocationFields";
import { TeamCalendarEventAttendanceType } from "./TeamCalendarEventAttendanceType";
import { TeamCalendarEventFormFileField } from "./TeamCalendarEventFormFileField";

interface TeamCalendarEventFormFieldsProps {
  form: UseFormReturn<any>;
}

export const TeamCalendarEventFormFields: React.FC<TeamCalendarEventFormFieldsProps> = ({
  form
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Title</FormLabel>
            <FormControl>
              <Input placeholder="Team Meeting" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Event details..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <TeamCalendarEventDateTimeLocationFields form={form} />

      <FormField
        control={form.control}
        name="attendanceType"
        render={({ field }) => (
          <TeamCalendarEventAttendanceType value={field.value} onChange={field.onChange} />
        )}
      />

      <TeamCalendarEventFormFileField form={form} name="attachments" label="Attachments (Images or Documents, 5MB max)" />
    </>
  );
};
