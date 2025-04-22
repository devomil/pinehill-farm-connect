
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { TimeOffRequest, User } from "@/types";
import { CalendarItem, CompanyEvent } from "./TeamCalendar.types";

export function useTeamCalendarData(currentUser: User) {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
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

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('calendar-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_off_requests' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_events' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, [currentUser, fetchData]);

  // Convert requests & events for listing/calendar highlight
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

  // Map days to events for quick lookup
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

  return {
    calendarItems,
    loading,
    dayItemMap,
    calendarHighlightDays,
    fetchData
  };
}
