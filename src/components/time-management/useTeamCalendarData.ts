
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types";
import { CompanyEvent, CalendarItem } from "./TeamCalendar.types";
import { useRequestFiltering } from "@/hooks/timeManagement/useRequestFiltering";
import { useTimeManagement } from "@/contexts/timeManagement";

export function useTeamCalendarData(currentUser: User) {
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [includeDeclinedRequests, setIncludeDeclinedRequests] = useState<boolean>(false);
  const { timeOffRequests } = useTimeManagement();
  const { filterTimeOffRequests } = useRequestFiltering();
  
  // Filter time off requests to exclude declined unless specifically requested
  const filteredTimeOffRequests = filterTimeOffRequests(timeOffRequests, includeDeclinedRequests);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch company events
      const { data: eventData, error: eventError } = await supabase
        .from("company_events")
        .select("*");

      if (eventError) {
        toast.error("Failed to load company events");
        console.error("Error fetching company events:", eventError);
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
    } catch (error) {
      toast.error("Error fetching calendar data");
      console.error("Error in useTeamCalendarData:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
    // Set up realtime subscription for company_events table
    const channel = supabase
      .channel('calendar-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_events' }, fetchData)
      .subscribe();
    
    return () => { 
      supabase.removeChannel(channel); 
    }
  }, [currentUser, fetchData]);

  // Convert events for listing/calendar highlight
  const eventItems: CalendarItem[] = events.map((e) => ({
    id: e.id,
    type: "event",
    label: e.title,
    startDate: new Date(e.start_date),
    endDate: new Date(e.end_date),
    attachments: e.attachments,
    attendanceType: e.attendance_type,
  }));
  
  // Add time off items from the context with fixed type
  const timeOffItems: CalendarItem[] = filteredTimeOffRequests?.map((request) => ({
    id: request.id,
    type: "time-off", // This type is now included in the CalendarItem interface
    label: `Time Off: ${request.status}`,
    startDate: new Date(request.start_date),
    endDate: new Date(request.end_date),
    attendanceType: "info-only"
  })) || [];
  
  // Combine all calendar items
  const calendarItems = [...eventItems, ...timeOffItems];

  // Map days to events for quick lookup
  const dayItemMap: Record<string, CalendarItem[]> = {};
  for (const item of calendarItems) {
    let day = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    
    while (day <= endDate) {
      const key = day.toISOString().split("T")[0];
      if (!dayItemMap[key]) dayItemMap[key] = [];
      dayItemMap[key].push(item);
      
      // Move to next day
      const nextDate = new Date(day);
      nextDate.setDate(nextDate.getDate() + 1);
      day = nextDate;
    }
  }
  
  const calendarHighlightDays = Object.keys(dayItemMap).map((d) => new Date(d));

  return {
    calendarItems,
    loading,
    dayItemMap,
    calendarHighlightDays,
    fetchData,
    includeDeclinedRequests,
    setIncludeDeclinedRequests
  };
}
