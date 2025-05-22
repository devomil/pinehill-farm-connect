
import React from "react";
import { ScheduleWidget } from "@/components/time-management/ScheduleWidget";
import { User } from "@/types";
import { useAllEmployeeShifts } from "@/contexts/timeManagement/hooks/useAllEmployeeShifts";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardScheduleSectionProps {
  currentUser: User;
  isCustomizing: boolean;
}

export const DashboardScheduleSection: React.FC<DashboardScheduleSectionProps> = ({
  currentUser,
  isCustomizing,
}) => {
  const { currentUser: authUser } = useAuth();
  const isAdmin = authUser?.role === "admin";
  
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
