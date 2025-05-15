
import React from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useAdminScheduleTools } from "@/hooks/workSchedule";
import { AdminSchedulingToolsBar } from "./AdminSchedulingToolsBar";
import { WorkSchedule } from "@/types/workSchedule";

interface AdminSchedulingToolsProps {
  selectedEmployee: string | null;
  currentMonth: Date;
  scheduleData: WorkSchedule | null;
}

export const AdminSchedulingTools: React.FC<AdminSchedulingToolsProps> = ({
  selectedEmployee, 
  currentMonth,
  scheduleData
}) => {
  const { unfilteredEmployees } = useEmployeeDirectory();
  
  // Use admin scheduling tools
  const { 
    assignWeekdayShifts, 
    assignWeekendShifts,
    checkTimeOffConflicts,
    autoAssignCoverage
  } = useAdminScheduleTools(scheduleData, (updatedSchedule) => {
    // This is a placeholder - the actual save function will be passed from parent
    console.log("Schedule updated:", updatedSchedule);
  });
  
  if (!selectedEmployee) return null;
  
  return (
    <AdminSchedulingToolsBar
      selectedEmployee={selectedEmployee}
      currentMonth={currentMonth}
      onAssignWeekday={assignWeekdayShifts}
      onAssignWeekend={assignWeekendShifts}
      onCheckConflicts={(shifts) => checkTimeOffConflicts(selectedEmployee, shifts)}
      onAutoAssignCoverage={autoAssignCoverage}
      availableEmployees={unfilteredEmployees}
      scheduleData={scheduleData}
    />
  );
};
