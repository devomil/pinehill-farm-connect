
import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar as DayCalendar } from "@/components/ui/calendar";
import { TimeOffRequest } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "@/components/ui/sonner";

interface TeamCalendarProps {
  currentUser: User;
}

type CalendarItem = {
  id: string;
  type: "timeoff" | "event";
  label: string;
  status?: "pending" | "approved" | "rejected";
  startDate: Date;
  endDate: Date;
};

export const TeamCalendar: React.FC<TeamCalendarProps> = ({ currentUser }) => {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Optionally simulate some static company events
  const STATIC_EVENTS: CalendarItem[] = [
    {
      id: "event1",
      type: "event",
      label: "Company Picnic",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20)
    },
    {
      id: "event2",
      type: "event",
      label: "Quarterly Review",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25)
    }
  ];

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      let query = supabase
        // @ts-ignore
        .from("time_off_requests")
        .select("*");

      // Employees can see only approved requests, admin/manager see all
      if (currentUser.role !== "admin" && currentUser.role !== "manager") {
        query = query.eq("status", "approved");
      }
      const { data, error } = await query;
      if (error) {
        toast.error("Failed to load time off requests");
        setLoading(false);
        return;
      }
      setRequests(
        data.map((r: any) => ({
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
      setLoading(false);
    }
    fetchRequests();
  }, [currentUser]);

  // Merge time-off requests and company events into CalendarItem[]
  const calendarItems: CalendarItem[] = [
    ...requests.map((r) => ({
      id: r.id,
      type: "timeoff",
      label: `Time off (${r.status})${r.reason ? ": " + r.reason : ""}`,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status
    })),
    ...STATIC_EVENTS
  ];

  // Create a map keyed by date string for single-day/timeoff items
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

  // To highlight days, return an array of Date for items
  const calendarHighlightDays = Object.keys(dayItemMap).map((d) => new Date(d));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Calendar</CardTitle>
        <CardDescription>
          View upcoming time-off and company events for better team coverage.
        </CardDescription>
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
              // When clicking a day: show event details below
            />
          </div>
          <div className="flex-1 mt-6 md:mt-0">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div>
                <h4 className="font-semibold mb-2">Upcoming</h4>
                {calendarItems.length === 0 &&
                  <div className="text-center text-muted-foreground">No team time off or events scheduled.</div>
                }
                <ul className="space-y-3">
                  {calendarItems
                    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                    .map((item) => (
                      <li key={item.type + "-" + item.id}>
                        <div className="flex items-center space-x-2">
                          {item.type === "event" ? (
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Clock className="h-4 w-4"
                              style={{
                                color:
                                  item.status === "approved"
                                    ? "#16a34a"
                                    : item.status === "pending"
                                    ? "#f59e42"
                                    : "#ef4444"
                              }}
                            />
                          )}
                          <span>
                            <span className="font-medium">{item.label}</span>
                            {" "}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {item.startDate.toLocaleDateString()}{" "}
                              {item.endDate > item.startDate
                                ? `— ${item.endDate.toLocaleDateString()}`
                                : ""}
                            </span>
                          </span>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
