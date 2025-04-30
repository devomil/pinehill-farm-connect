
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notifyManager } from "@/utils/notifyManager";
import { User } from "@/types";

interface UseTeamCalendarEventFormProps {
  currentUser: User;
  onEventCreated: () => void;
  setOpen: (v: boolean) => void;
  form: UseFormReturn<any>;
}

export const useTeamCalendarEventForm = ({
  currentUser,
  onEventCreated,
  setOpen,
  form,
}: UseTeamCalendarEventFormProps) => {
  const [loading, setLoading] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(false);
  const [notifyAll, setNotifyAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const onSubmit = async (values: any) => {
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
              reader.readAsDataURL(file as Blob);
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

      const { error } = await supabase
        .from("company_events")
        .insert([newEvent]);
        
      if (error) {
        toast.error("Failed to create event");
        return;
      }
      
      toast.success("Event created successfully");
      if (sendNotifications) {
        if (notifyAll) {
          await notifyManager("event_created", 
            {
              id: currentUser.id,
              name: currentUser.name || "Unknown User",
              email: currentUser.email
            }, 
            {
              event: newEvent,
              notificationType: "team_calendar",
              recipients: "all",
            }
          );
        } else {
          await notifyManager("event_created", 
            {
              id: currentUser.id,
              name: currentUser.name || "Unknown User", 
              email: currentUser.email
            }, 
            {
              event: newEvent,
              notificationType: "team_calendar",
              recipients: selectedUserIds,
            }
          );
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

  return {
    loading,
    sendNotifications,
    setSendNotifications,
    notifyAll,
    setNotifyAll,
    selectedUserIds,
    setSelectedUserIds,
    onSubmit,
  };
};
