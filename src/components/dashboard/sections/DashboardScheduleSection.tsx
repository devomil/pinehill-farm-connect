
import React from "react";
import { ScheduleWidget } from "@/components/time-management/ScheduleWidget";
import { User } from "@/types";
import { useAllEmployeeShifts } from "@/contexts/timeManagement/hooks/useAllEmployeeShifts";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardScheduleSectionProps {
  currentUser?: User;
  isCustomizing?: boolean;
  isAdmin: boolean;
  scheduleData: any;
  scheduleLoading: boolean;
  viewAllUrl?: string;
}

export const DashboardScheduleSection: React.FC<DashboardScheduleSectionProps> = ({
  currentUser,
  isCustomizing = false,
  isAdmin,
  scheduleData,
  scheduleLoading,
  viewAllUrl,
}) => {
  // Only fetch all employee shifts if user is an admin
  const { shiftsMap: allEmployeeShifts, loading } = isAdmin 
    ? useAllEmployeeShifts() 
    : { shiftsMap: undefined, loading: false };
  
  return (
    <ScheduleWidget 
      currentUser={currentUser} 
      isCustomizing={isCustomizing}
      allEmployeeShifts={allEmployeeShifts}
    />
  );
};
