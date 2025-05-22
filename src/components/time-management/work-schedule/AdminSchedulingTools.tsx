
import React from "react";
import { WorkSchedule } from "@/types/workSchedule";
import { AdminSchedulingToolsBar } from "./AdminSchedulingToolsBar";
import { useAdminScheduleTools } from "@/hooks/workSchedule/useAdminScheduleTools";

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
  const {
    availableEmployees,
    handleAssignWeekdayShifts,
    handleAssignWeekendShifts,
    handleCheckTimeOffConflicts,
    handleAutoAssignCoverage
  } = useAdminScheduleTools({
    selectedEmployee,
    scheduleData
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
      onAssignWeekday={handleAssignWeekdayShifts}
      onAssignWeekend={handleAssignWeekendShifts}
      onCheckConflicts={handleCheckTimeOffConflicts}
      onAutoAssignCoverage={handleAutoAssignCoverage}
      onAddSpecificDayShift={onAddSpecificDayShift}
    />
  );
};
