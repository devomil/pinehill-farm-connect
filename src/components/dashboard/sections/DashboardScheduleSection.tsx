
import React from "react";
import { AdminEmployeeScheduleCard } from "@/components/time-management/work-schedule/AdminEmployeeScheduleCard";
import { EmployeeScheduleCard } from "@/components/time-management/work-schedule/EmployeeScheduleCard";

interface DashboardScheduleSectionProps {
  isAdmin: boolean;
  scheduleData: any;
  scheduleLoading: boolean;
}

export const DashboardScheduleSection: React.FC<DashboardScheduleSectionProps> = ({
  isAdmin,
  scheduleData,
  scheduleLoading,
}) => {
  return (
    <div className="md:col-span-2">
      {isAdmin ? (
        <AdminEmployeeScheduleCard clickable={true} viewAllUrl="/time?tab=work-schedules" />
      ) : (
        <EmployeeScheduleCard 
          schedule={scheduleData}
          loading={scheduleLoading}
          clickable={true}
          viewAllUrl="/time?tab=work-schedules"
        />
      )}
    </div>
  );
};
