
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { useAuth } from "@/contexts/AuthContext";

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "team">("month");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { currentUser } = useAuth();

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage schedules</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>
                    View team schedules and time-off
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="rounded-full p-2 hover:bg-muted"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-medium">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="rounded-full p-2 hover:bg-muted"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "team")}>
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="month">Month</TabsTrigger>
                      <TabsTrigger value="team">Team View</TabsTrigger>
                    </TabsList>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="time-off">Time Off</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="meeting">Meetings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <TabsContent value="month" className="mt-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      month={currentMonth}
                      className="rounded-md border"
                    />
                  </TabsContent>
                  
                  <TabsContent value="team" className="mt-0">
                    <TeamCalendar currentUser={currentUser} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Today</CardTitle>
                <CardDescription>
                  {format(new Date(), "EEEE, MMMM do, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  No events scheduled for today
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
