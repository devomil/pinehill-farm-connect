
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

interface EventType {
  id: string;
  title: string;
  date: Date;
  type: "time-off" | "training" | "meeting" | "shift";
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "team">("month");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Sample events for demonstration
  const events: EventType[] = [
    {
      id: "1",
      title: "John's Time Off",
      date: new Date(),
      type: "time-off",
    },
    {
      id: "2",
      title: "HIPAA Training",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      type: "training",
    },
    {
      id: "3",
      title: "Team Meeting",
      date: new Date(new Date().setDate(new Date().getDate() + 4)),
      type: "meeting",
    },
    {
      id: "4",
      title: "Opening Shift",
      date: new Date(new Date().setDate(new Date().getDate() - 2)),
      type: "shift",
    },
  ];

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Function to get events for the current date
  const getTodaysEvents = () => {
    return events.filter(
      (event) => event.date.toDateString() === new Date().toDateString()
    );
  };

  // Function to get upcoming events
  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter((event) => event.date > today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

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
                        <SelectItem value="shift">Shifts</SelectItem>
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
                    <div className="border rounded-md p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b">
                          <div className="w-1/4 font-medium">Employee</div>
                          <div className="flex-1 grid grid-cols-7 text-center text-sm text-muted-foreground">
                            <div>Sun</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                          </div>
                        </div>
                        
                        {["John Smith", "Sarah Johnson", "Mike Davis", "Emily Wilson"].map((name, i) => (
                          <div key={i} className="flex items-center justify-between py-2">
                            <div className="w-1/4 font-medium">{name}</div>
                            <div className="flex-1 grid grid-cols-7 gap-1">
                              {Array(7).fill(null).map((_, dayIndex) => {
                                // This is just a placeholder visualization
                                // In a real app, you'd match this with actual schedule data
                                const hasEvent = Math.random() > 0.7;
                                const eventType = ["bg-blue-100 border-blue-300", "bg-green-100 border-green-300", "bg-amber-100 border-amber-300"][Math.floor(Math.random() * 3)];
                                
                                return (
                                  <div
                                    key={dayIndex}
                                    className={`h-6 rounded-sm border ${hasEvent ? eventType : "border-transparent"}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-1/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today</CardTitle>
                <CardDescription>
                  {format(new Date(), "EEEE, MMMM do, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getTodaysEvents().length > 0 ? (
                  <div className="space-y-4">
                    {getTodaysEvents().map((event) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <Badge
                          className={
                            event.type === "time-off"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : event.type === "training"
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                              : event.type === "meeting"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }
                        >
                          {event.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(event.date, "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No events scheduled for today
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Your scheduled events</CardDescription>
              </CardHeader>
              <CardContent>
                {getUpcomingEvents().length > 0 ? (
                  <div className="space-y-4">
                    {getUpcomingEvents().slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <Badge
                          className={
                            event.type === "time-off"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : event.type === "training"
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                              : event.type === "meeting"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }
                        >
                          {event.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(event.date, "EEE, MMM d")} at{" "}
                            {format(event.date, "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No upcoming events scheduled
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
