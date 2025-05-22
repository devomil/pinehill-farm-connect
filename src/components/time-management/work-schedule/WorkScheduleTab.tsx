
import React, { useState, useEffect } from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { User } from "@/types";
import { AdminWorkScheduleEditor } from "./AdminWorkScheduleEditor";
import { EmployeeScheduleView } from "./EmployeeScheduleView";
import { useWorkSchedule } from "./hooks/useWorkSchedule";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { WorkScheduleHeader } from "./WorkScheduleHeader";
import { WorkScheduleError } from "./WorkScheduleError";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamCalendar } from "../TeamCalendar";
import { WorkScheduleCalendar } from "./WorkScheduleCalendar";
import { useAllEmployeeShifts } from "@/contexts/timeManagement/hooks/useAllEmployeeShifts";
import { toast } from "sonner";

interface WorkScheduleTabProps {
  isAdmin: boolean;
  currentUser: User;
}

export const WorkScheduleTab: React.FC<WorkScheduleTabProps> = ({ isAdmin, currentUser }) => {
  const { employees } = useEmployeeDirectory();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
    isAdmin ? null : currentUser.id
  );
  
  const {
    scheduleData,
    loading,
    error,
    saveSchedule,
    resetSchedule,
    copyFromLastMonth
  } = useWorkSchedule(selectedEmployee);
  
  // Also fetch all employee shifts to ensure we have data
  const { shiftsMap: allEmployeeShiftsMap } = useAllEmployeeShifts();
  
  const currentMonthLabel = format(new Date(), "MMMM yyyy");
  const [viewMode, setViewMode] = useState<"work-schedules" | "company-events">("work-schedules");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // If user is not admin, they can only see their own schedule
  useEffect(() => {
    if (!isAdmin) {
      setSelectedEmployee(currentUser.id);
    }
  }, [isAdmin, currentUser.id]);

  // Handler for employee selection that enforces restrictions
  const handleSelectEmployee = (employeeId: string) => {
    if (isAdmin) {
      setSelectedEmployee(employeeId);
    } else {
      // Non-admins can only see their own schedule
      setSelectedEmployee(currentUser.id);
    }
  };

  // Convert scheduleData to shiftsMap for calendar display
  const shiftsMap = React.useMemo(() => {
    const map = new Map<string, any[]>();
    
    if (scheduleData?.shifts) {
      scheduleData.shifts.forEach(shift => {
        const dateKey = shift.date;
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(shift);
      });
    }
    
    return map;
  }, [scheduleData]);

  // Use the combined shiftsMap for display if we're in admin view with no employee selected
  const displayShiftsMap = (isAdmin && !selectedEmployee) ? allEmployeeShiftsMap : shiftsMap;

  // Log the number of shifts we're showing for debugging
  useEffect(() => {
    let totalShifts = 0;
    displayShiftsMap?.forEach(shifts => {
      totalShifts += shifts.length;
    });
    console.log(`WorkScheduleTab: Displaying ${totalShifts} total shifts across ${displayShiftsMap?.size || 0} days`);
  }, [displayShiftsMap]);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <WorkScheduleHeader 
          currentMonthLabel={currentMonthLabel}
          isAdmin={isAdmin}
          selectedEmployee={selectedEmployee}
          employees={employees}
          onSelectEmployee={handleSelectEmployee}
          onCopyFromLastMonth={copyFromLastMonth}
          loading={loading}
        />
        
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "work-schedules" | "company-events")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="work-schedules">Work Schedules</TabsTrigger>
            <TabsTrigger value="company-events">Company Events</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {error ? (
          <WorkScheduleError error={error} />
        ) : viewMode === "work-schedules" ? (
          isAdmin ? (
            <AdminWorkScheduleEditor
              selectedEmployee={selectedEmployee}
              scheduleData={scheduleData}
              onSave={saveSchedule}
              onReset={resetSchedule}
              loading={loading}
            />
          ) : (
            <>
              <WorkScheduleCalendar 
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                shiftsMap={displayShiftsMap}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                isAdminView={isAdmin}
                showEmployeeNames={true}
                title="Work Schedule"
              />
              <EmployeeScheduleView 
                scheduleData={scheduleData}
                loading={loading}
              />
            </>
          )
        ) : (
          <TeamCalendar currentUser={currentUser} />
        )}
      </CardContent>
    </Card>
  );
};
