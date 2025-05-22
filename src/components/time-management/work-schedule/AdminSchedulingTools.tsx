
import React from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { AdminSchedulingToolsBar } from "./AdminSchedulingToolsBar";
import { useAdminScheduleTools } from "@/hooks/workSchedule/useAdminScheduleTools";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory"; 

interface AdminSchedulingToolsProps {
  selectedEmployee: string | null;
  currentMonth: Date;
  scheduleData: WorkSchedule | null;
  onAddSpecificDayShift?: (
    employeeId: string,
    date: Date,
    startTime: string,
    endTime: string
  ) => void;
}

export const AdminSchedulingTools: React.FC<AdminSchedulingToolsProps> = ({
  selectedEmployee,
  currentMonth,
  scheduleData,
  onAddSpecificDayShift
}) => {
  // Get employees from the directory
  const { employees } = useEmployeeDirectory();
  
  // Filter out the currently selected employee
  const availableEmployees: User[] = employees || [];
  
  const {
    assignWeekdayShifts,
    assignWeekendShifts,
    checkTimeOffConflicts,
    autoAssignCoverage,
    loading
  } = useAdminScheduleTools(scheduleData, (updatedSchedule) => {
    console.log("Schedule updated:", updatedSchedule);
    // In a real implementation, this would call a parent function to update the schedule
  });

  if (!selectedEmployee) {
    return null;
  }

  return (
    <AdminSchedulingToolsBar
      selectedEmployee={selectedEmployee}
      currentMonth={currentMonth}
      scheduleData={scheduleData}
      availableEmployees={availableEmployees}
      onAssignWeekday={assignWeekdayShifts}
      onAssignWeekend={assignWeekendShifts}
      onCheckConflicts={checkTimeOffConflicts}
      onAutoAssignCoverage={autoAssignCoverage}
      onAddSpecificDayShift={onAddSpecificDayShift}
    />
  );
};
