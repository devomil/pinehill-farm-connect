
import React, { useEffect, useState } from "react";
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
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  // Fetch both time-off requests and company events
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch time-off requests
      try {
        let query = supabase
          .from("time_off_requests")
          .select("*");

        // Employees can see only approved requests, admin/manager see all
        if (currentUser.role !== "admin" && currentUser.role !== "manager") {
          query = query.eq("status", "approved");
        }
        const { data: requestData, error: requestError } = await query;
        if (requestError) {
          toast.error("Failed to load time off requests");
          console.error(requestError);
        } else {
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
        
        // Fetch company events
        const { data: eventData, error: eventError } = await supabase
          .from("company_events")
          .select("*");
        
        if (eventError) {
          toast.error("Failed to load company events");
          console.error(eventError);
        } else if (eventData) {
          setEvents(eventData);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Set up real-time listener for changes
    const channel = supabase
      .channel('calendar-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'time_off_requests' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'company_events' }, 
        () => fetchData()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Map time-off requests to CalendarItem type
  const timeoffItems: CalendarItem[] = requests.map((r) => ({
    id: r.id,
    type: "timeoff",
    label: `Time off (${r.status})${r.reason ? ": " + r.reason : ""}`,
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status
  }));
  
  // Map company events to CalendarItem type
  const eventItems: CalendarItem[] = events.map((e) => ({
    id: e.id,
    type: "event",
    label: e.title,
    startDate: new Date(e.start_date),
    endDate: new Date(e.end_date),
    attachments: e.attachments,
    attendanceType: e.attendance_type as "required" | "optional" | "would-like" | "info-only"
  }));
  
  // Combine both types into a single array
  const calendarItems: CalendarItem[] = [...timeoffItems, ...eventItems];

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
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const newEvent = {
        title: values.title,
        description: values.description || "",
        start_date: values.startDate.toISOString(),
        end_date: values.endDate.toISOString(),
        created_by: currentUser.id,
        attachments: values.attachments || [],
        attendance_type: values.attendanceType
      };
      
      const { data, error } = await supabase
        .from("company_events")
        .insert(newEvent)
        .select();
        
      if (error) {
        toast.error("Failed to create event");
        console.error(error);
        return;
      }
      
      toast.success("Event created successfully");
      
      if (values.sendNotifications) {
        await notifyManager("event_created", currentUser, {
          event: newEvent,
          notificationType: "team_calendar"
        });
        toast.success("Notifications sent to team members");
      }
      
      setDialogOpen(false);
      form.reset();
      
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("An error occurred");
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      form.setValue("startDate", date);
      form.setValue("endDate", date);
    }
  };
  
  function getAttendanceIcon(type: string | undefined) {
    switch(type) {
      case "required":
        return <Check className="h-4 w-4 text-red-500" />;
      case "would-like":
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case "optional":
        return <CircleDot className="h-4 w-4 text-green-500" />;
      case "info-only":
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  }

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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>
                    Create a new calendar event for your team
                  </DialogDescription>
                </DialogHeader>
                
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
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                value={field.value.toISOString().split('T')[0]} 
                                onChange={(e) => field.onChange(new Date(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                value={field.value.toISOString().split('T')[0]} 
                                onChange={(e) => field.onChange(new Date(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="attendanceType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Attendance Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="required" id="required" />
                                <Label htmlFor="required" className="flex items-center gap-1">
                                  <Check className="h-4 w-4 text-red-500" />
                                  Required
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="would-like" id="would-like" />
                                <Label htmlFor="would-like" className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4 text-blue-500" />
                                  Would like to attend
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="optional" id="optional" />
                                <Label htmlFor="optional" className="flex items-center gap-1">
                                  <CircleDot className="h-4 w-4 text-green-500" />
                                  Optional
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="info-only" id="info-only" />
                                <Label htmlFor="info-only" className="flex items-center gap-1">
                                  <Info className="h-4 w-4 text-gray-500" />
                                  Information only
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="send-notifications"
                        checked={form.watch("sendNotifications")}
                        onChange={(e) => form.setValue("sendNotifications", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="send-notifications" className="flex items-center gap-1">
                        <Bell className="h-4 w-4 text-amber-500" />
                        Send notifications to team members
                      </Label>
                    </div>
                    
                    <DialogFooter className="pt-4">
                      <Button type="submit">Create Event</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
              <div>
                <h4 className="font-semibold mb-2">
                  {selectedDate 
                    ? `Events for ${selectedDate.toLocaleDateString()}` 
                    : "Upcoming Events"}
                </h4>
                {calendarItems.length === 0 &&
                  <div className="text-center text-muted-foreground">No team time off or events scheduled.</div>
                }
                <ul className="space-y-3">
                  {calendarItems
                    .filter(item => !selectedDate || 
                      (item.startDate <= selectedDate && item.endDate >= selectedDate))
                    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                    .map((item) => (
                      <li key={item.type + "-" + item.id} className="border p-2 rounded-md hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          {item.type === "event" ? (
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-4 w-4 text-blue-500" />
                              <span>
                                <span className="font-medium">{item.label}</span>
                                <div className="flex items-center space-x-1 text-xs">
                                  {getAttendanceIcon(item.attendanceType)}
                                  <span className="text-muted-foreground">
                                    {item.startDate.toLocaleDateString()}{" "}
                                    {item.endDate > item.startDate
                                      ? `— ${item.endDate.toLocaleDateString()}`
                                      : ""}
                                  </span>
                                  {item.attachments && item.attachments.length > 0 && (
                                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
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
                              <span>
                                <span className="font-medium">{item.label}</span>
                                <div className="text-xs text-muted-foreground">
                                  {item.startDate.toLocaleDateString()}{" "}
                                  {item.endDate > item.startDate
                                    ? `— ${item.endDate.toLocaleDateString()}`
                                    : ""}
                                </div>
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
