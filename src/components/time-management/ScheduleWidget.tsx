
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";
import { useTimeManagement } from "@/contexts/timeManagement";
import { User } from "@/types";
import { GripVertical, RefreshCcw } from "lucide-react";
import { WorkShift } from "@/types/workSchedule";
import { WorkScheduleCalendar } from "./work-schedule/WorkScheduleCalendar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamCalendar } from "./TeamCalendar";
import { useAllEmployeeShifts } from "@/contexts/timeManagement/hooks/useAllEmployeeShifts";
import { toast } from "sonner";

interface ScheduleWidgetProps {
  currentUser?: User;
  className?: string;
  isCustomizing?: boolean;
  allEmployeeShifts?: Map<string, WorkShift[]>;
  onRefresh?: () => void;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ 
  currentUser, 
  className, 
  isCustomizing = false,
  allEmployeeShifts,
  onRefresh
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [includeDeclinedRequests, setIncludeDeclinedRequests] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"schedule" | "events">("schedule");
  const { timeOffRequests = [] } = useTimeManagement();
  const { currentUser: authUser } = useAuth();
  const isAdmin = authUser?.role === "admin";
  
  // Always fetch shifts regardless of allEmployeeShifts prop to ensure we have data
  const { shiftsMap: fetchedShiftsMap, refreshShifts } = useAllEmployeeShifts();
  
  // Use our calendar events hook to get all calendar items
  const { shiftsMap: userShiftsMap } = useCalendarEvents(
    currentUser,
    currentMonth,
    includeDeclinedRequests,
    timeOffRequests || []
  );
  
  // Choose which shifts data to use - prefer all employee shifts if provided (for admin view)
  // Fall back to fetched shifts map if allEmployeeShifts is not provided
  const displayShiftsMap = allEmployeeShifts || fetchedShiftsMap || userShiftsMap;
  
  // Handle refresh - enhanced to ensure data consistency
  const handleRefresh = useCallback(() => {
    console.log("ScheduleWidget: Refreshing data");
    refreshShifts().then(() => {
      if (onRefresh) {
        onRefresh();
      }
      toast.success("Schedule refreshed");
    });
  }, [refreshShifts, onRefresh]);
  
  // Effect to handle refresh requests
  useEffect(() => {
    if (onRefresh) {
      handleRefresh();
    }
  }, [onRefresh, handleRefresh]);

  useEffect(() => {
    // Log the amount of shifts we're showing
    let totalShifts = 0;
    displayShiftsMap?.forEach(shifts => {
      totalShifts += shifts.length;
    });
    console.log(`ScheduleWidget: Displaying ${totalShifts} total shifts across ${displayShiftsMap?.size || 0} days`);
  }, [displayShiftsMap]);

  // Handle deleting a shift
  const handleDeleteShift = (shiftId: string) => {
    if (isAdmin) {
      console.log("ScheduleWidget: Deleting shift", shiftId);
      // After deletion, refresh the shifts
      refreshShifts().then(() => {
        toast.success("Shift deleted successfully");
        if (onRefresh) {
          onRefresh();
        }
      });
    }
  };

  return (
    <Card className={cn("mt-4 relative group", className, isCustomizing ? "border-2 border-dashed border-blue-300" : "")}>
      {isCustomizing && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-600 px-2 py-0.5 text-xs font-medium rounded">
          <GripVertical className="h-4 w-4 inline-block mr-1" /> Drag to move
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>View team schedules and time-off</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <input
              type="checkbox"
              id="showDeclinedRequests"
              checked={includeDeclinedRequests}
              onChange={(e) => setIncludeDeclinedRequests(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="showDeclinedRequests" className="text-sm text-muted-foreground">
              Show Declined
            </label>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-8 px-2 text-xs flex items-center gap-1"
          >
            <RefreshCcw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "schedule" | "events")} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Work Schedule</TabsTrigger>
            <TabsTrigger value="events">Company Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="mt-2">
            <WorkScheduleCalendar 
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              shiftsMap={displayShiftsMap}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              isAdminView={isAdmin}
              showEmployeeNames={true}
              title="Work Schedule"
              onDeleteShift={handleDeleteShift}
            />
          </TabsContent>
          
          <TabsContent value="events" className="mt-2">
            {currentUser && <TeamCalendar currentUser={currentUser} />}
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-4">
          <Link to="/time?tab=work-schedules">
            <Button variant="accent" size="sm" className="w-full">
              View Full Calendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
