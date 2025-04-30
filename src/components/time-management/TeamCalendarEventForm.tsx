
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
import { teamCalendarEventFormSchema } from "./TeamCalendarEventFormSchema";

export const TeamCalendarEventForm: React.FC<TeamCalendarEventFormProps> = ({
  open,
  setOpen,
  onEventCreated,
  currentUser,
}) => {
  const { unfilteredEmployees, loading: employeesLoading } = useEmployees();

  const form = useForm<z.infer<typeof teamCalendarEventFormSchema>>({
    resolver: zodResolver(teamCalendarEventFormSchema),
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
    onSubmit: calendarEventSubmit,
    isSaving
  } = useTeamCalendarEventForm(() => {
    onEventCreated();
    setOpen(false);
  });

  // Create a wrapper function to handle the form submission
  // and convert the string time values to Date objects
  const handleSubmit = (data: z.infer<typeof teamCalendarEventFormSchema>) => {
    // Convert string times to Date objects
    const startDateTime = new Date(data.startDate);
    const endDateTime = new Date(data.endDate);
    
    if (data.startTime) {
      const [hours, minutes] = data.startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes);
    }
    
    if (data.endTime) {
      const [hours, minutes] = data.endTime.split(':').map(Number);
      endDateTime.setHours(hours, minutes);
    }
    
    // Call the onSubmit function with properly formatted data
    calendarEventSubmit({
      title: data.title,
      description: data.description,
      location: data.location,
      startTime: startDateTime,
      endTime: endDateTime,
    });
  };

  return (
    <TeamCalendarEventFormDialog open={open} setOpen={setOpen}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
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
