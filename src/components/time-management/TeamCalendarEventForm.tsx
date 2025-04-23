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
import { toast } from "sonner";
import { notifyManager } from "@/utils/notifyManager";
import { TeamCalendarEventFormDialog } from "./TeamCalendarEventFormDialog";
import { TeamCalendarEventFormFileField } from "./TeamCalendarEventFormFileField";
import { TeamCalendarEventAttendanceType } from "./TeamCalendarEventAttendanceType";
import { useEmployees } from "@/hooks/useEmployees";
import { TeamCalendarEventDateTimeLocationFields } from "./TeamCalendarEventDateTimeLocationFields";
import { TeamCalendarEventNotifySelector } from "./TeamCalendarEventNotifySelector";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  attachments: z.any().optional(),
  attendanceType: z.enum(["required", "optional", "would-like", "info-only"]),
});

export const TeamCalendarEventForm: React.FC<TeamCalendarEventFormProps> = ({
  open,
  setOpen,
  onEventCreated,
  currentUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(false);
  const [notifyAll, setNotifyAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { unfilteredEmployees, loading: employeesLoading } = useEmployees();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      attachments: [],
      attendanceType: "required",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const start_datetime = `${values.startDate.toISOString().split("T")[0]}T${values.startTime || "09:00"}:00`;
      const end_datetime = `${values.endDate.toISOString().split("T")[0]}T${values.endTime || "10:00"}:00`;

      let processedAttachments: string[] = [];
      
      if (values.attachments && values.attachments instanceof FileList) {
        processedAttachments = await Promise.all(
          Array.from(values.attachments).map(file => 
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
            })
          )
        );
      }

      const newEvent = {
        title: values.title,
        description: values.description || "",
        start_date: values.startDate.toISOString().split("T")[0],
        end_date: values.endDate.toISOString().split("T")[0],
        created_by: currentUser.id,
        attendance_type: values.attendanceType,
        attachments: processedAttachments,
        start_time: values.startTime,
        end_time: values.endTime,
        location: values.location,
      };

      const { error, data } = await supabase
        .from("company_events")
        .insert([newEvent]);
        
      if (error) {
        toast.error("Failed to create event");
        setLoading(false);
        return;
      }
      
      toast.success("Event created successfully");
      if (sendNotifications) {
        if (notifyAll) {
          await notifyManager("event_created", currentUser, {
            event: newEvent,
            notificationType: "team_calendar",
            recipients: "all",
          });
        } else {
          await notifyManager("event_created", currentUser, {
            event: newEvent,
            notificationType: "team_calendar",
            recipients: selectedUserIds,
          });
        }
        toast.success("Notifications sent");
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

          <TeamCalendarEventDateTimeLocationFields form={form} />

          <FormField
            control={form.control}
            name="attendanceType"
            render={({ field }) => (
              <TeamCalendarEventAttendanceType value={field.value} onChange={field.onChange} />
            )}
          />

          <TeamCalendarEventFormFileField form={form} name="attachments" label="Attachments (Images or Documents, 5MB max)" />

          <TeamCalendarEventNotifySelector
            enabled={sendNotifications}
            setEnabled={setSendNotifications}
            notifyAll={notifyAll}
            setNotifyAll={setNotifyAll}
            selectedUserIds={selectedUserIds}
            setSelectedUserIds={setSelectedUserIds}
            allEmployees={unfilteredEmployees}
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading || employeesLoading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </TeamCalendarEventFormDialog>
  );
};
