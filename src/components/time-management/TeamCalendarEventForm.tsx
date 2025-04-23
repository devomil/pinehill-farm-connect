
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEmployees } from "@/hooks/useEmployees";
import { TeamCalendarEventFormDialog } from "./TeamCalendarEventFormDialog";
import { TeamCalendarEventFormFields } from "./TeamCalendarEventFormFields";
import { TeamCalendarEventNotifySelector } from "./TeamCalendarEventNotifySelector";
import { useTeamCalendarEventForm } from "@/hooks/useTeamCalendarEventForm";
import { TeamCalendarEventFormProps } from "./TeamCalendar.types";

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

  const {
    loading,
    sendNotifications,
    setSendNotifications,
    notifyAll,
    setNotifyAll,
    selectedUserIds,
    setSelectedUserIds,
    onSubmit
  } = useTeamCalendarEventForm({
    currentUser,
    onEventCreated,
    setOpen,
    form,
  });

  return (
    <TeamCalendarEventFormDialog open={open} setOpen={setOpen}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <TeamCalendarEventFormFields form={form} />

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
