
import React, { useEffect, useState, useCallback } from "react";
import { Calendar as CalendarIcon, Clock, PlusCircle, Info, Check, ThumbsUp, CircleDot, Paperclip, Bell, BellOff, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar as DayCalendar } from "@/components/ui/calendar";
import { TimeOffRequest } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { notifyManager } from "@/utils/notifyManager";
import { TeamCalendarEventForm } from "./TeamCalendarEventForm";
import { TeamCalendarEventsList } from "./TeamCalendarEventsList";
// Remove the conflicting import of CalendarItem

interface TeamCalendarProps {
  currentUser: User;
}

// Define the type locally since we're no longer importing it
type CalendarItem = {
  id: string;
  type: "timeoff" | "event";
  label: string;
  status?: "pending" | "approved" | "rejected";
  startDate: Date;
  endDate: Date;
  attachments?: string[];
  attendanceType?: "required" | "optional" | "would-like" | "info-only";
};

type CompanyEvent = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: string;
  attachments?: string[];
  attendance_type: "required" | "optional" | "would-like" | "info-only";
};

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  attachments: z.array(z.string()).optional(),
  attendanceType: z.enum(["required", "optional", "would-like", "info-only"]),
  sendNotifications: z.boolean().default(false),
});

export const TeamCalendar: React.FC<TeamCalendarProps> = ({ currentUser }) => {
  const [requests, setRequests] = React.useState<TimeOffRequest[]>([]);
  const [events, setEvents] = React.useState<CompanyEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

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

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      let requestQuery = supabase
        .from("time_off_requests")
        .select("*");
      if (currentUser.role !== "admin" && currentUser.role !== "manager") {
        requestQuery = requestQuery.eq("status", "approved");
      }
      const { data: requestData, error: requestError } = await requestQuery;
      if (requestError) {
        toast.error("Failed to load time off requests");
      } else if (requestData) {
        setRequests(
          requestData.map((r: any) => ({
            ...r,
            startDate: new Date(r.start_date),
            endDate: new Date(r.end_date),
            status: r.status,
            id: r.id,
            reason: r.reason,
            userId: r.user_id,
            notes: r.notes,
          }))
        );
      }
      const { data: eventData, error: eventError } = await supabase
        .from("company_events")
        .select("*");
      if (eventError) {
        toast.error("Failed to load company events");
      } else if (eventData) {
        setEvents(
          eventData.map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description || "",
            start_date: e.start_date,
            end_date: e.end_date,
            created_by: e.created_by,
            attendance_type: e.attendance_type,
            attachments: (e.attachments ?? []) as string[],
          }))
        );
      }
    } catch {
      toast.error("Error fetching calendar data");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('calendar-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_off_requests' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_events' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, [currentUser, fetchData]);

  const timeoffItems: CalendarItem[] = requests.map((r) => ({
    id: r.id,
    type: "timeoff",
    label: `Time off (${r.status})${r.reason ? ": " + r.reason : ""}`,
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status,
  }));
  const eventItems: CalendarItem[] = events.map((e) => ({
    id: e.id,
    type: "event",
    label: e.title,
    startDate: new Date(e.start_date),
    endDate: new Date(e.end_date),
    attachments: e.attachments,
    attendanceType: e.attendance_type,
  }));
  const calendarItems = [...timeoffItems, ...eventItems];

  const dayItemMap: Record<string, CalendarItem[]> = {};
  for (const item of calendarItems) {
    let day = new Date(item.startDate);
    while (day <= item.endDate) {
      const key = day.toISOString().split("T")[0];
      if (!dayItemMap[key]) dayItemMap[key] = [];
      dayItemMap[key].push(item);
      day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    }
  }
  const calendarHighlightDays = Object.keys(dayItemMap).map((d) => new Date(d));

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Team Calendar</CardTitle>
            <CardDescription>
              View upcoming time-off and company events for better team coverage.
            </CardDescription>
          </div>
          {(currentUser.role === "admin" || currentUser.role === "manager") && (
            <TeamCalendarEventForm
              open={dialogOpen}
              setOpen={setDialogOpen}
              onEventCreated={fetchData}
              currentUser={currentUser}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="flex-1">
            <DayCalendar
              mode="multiple"
              selected={calendarHighlightDays}
              modifiersClassNames={{
                selected: "bg-blue-400 text-white !opacity-100"
              }}
              className="border border-muted rounded-md"
              showOutsideDays
              onDayClick={handleDateSelect}
            />
          </div>
          <div className="flex-1 mt-6 md:mt-0">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <TeamCalendarEventsList
                calendarItems={calendarItems}
                selectedDate={selectedDate}
                loading={loading}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
