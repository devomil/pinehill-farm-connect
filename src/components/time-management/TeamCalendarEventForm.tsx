
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import { notifyManager } from "@/utils/notifyManager";
import { TeamCalendarEventFormDialog } from "./TeamCalendarEventFormDialog";
import { TeamCalendarEventFormFileField } from "./TeamCalendarEventFormFileField";
import { TeamCalendarEventAttendanceType } from "./TeamCalendarEventAttendanceType";

export interface TeamCalendarEventFormProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onEventCreated: () => void;
  currentUser: any;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  attachments: z.array(z.string()).optional(),
  attendanceType: z.enum(["required", "optional", "would-like", "info-only"]),
  sendNotifications: z.boolean().default(false),
});

export const TeamCalendarEventForm: React.FC<TeamCalendarEventFormProps> = ({
  open,
  setOpen,
  onEventCreated,
  currentUser,
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      attachments: [],
      attendanceType: "required",
      sendNotifications: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const newEvent = {
        title: values.title,
        description: values.description || "",
        start_date: values.startDate.toISOString().split("T")[0],
        end_date: values.endDate.toISOString().split("T")[0],
        created_by: currentUser.id,
        attendance_type: values.attendanceType,
        attachments: values.attachments ?? [],
      };
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("company_events")
        .insert([newEvent]);
      if (error) {
        toast.error("Failed to create event");
        setLoading(false);
        return;
      }
      toast.success("Event created successfully");
      if (values.sendNotifications) {
        await notifyManager("event_created", currentUser, {
          event: newEvent,
          notificationType: "team_calendar",
        });
        toast.success("Notifications sent to team members");
      }
      setOpen(false);
      form.reset();
      onEventCreated();
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeamCalendarEventFormDialog open={open} setOpen={setOpen}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
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
          </div>

          <FormField
            control={form.control}
            name="attendanceType"
            render={({ field }) => (
              <TeamCalendarEventAttendanceType value={field.value} onChange={field.onChange} />
            )}
          />

          <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
              <TeamCalendarEventFormFileField value={field.value || []} onChange={field.onChange} />
            )}
          />

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="send-notifications"
              checked={form.watch("sendNotifications")}
              onChange={(e) => form.setValue("sendNotifications", e.target.checked)}
              className="h-4 w-4"
            />
            <FormLabel htmlFor="send-notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4 text-amber-500" />
              Send notifications to team members
            </FormLabel>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </TeamCalendarEventFormDialog>
  );
};
