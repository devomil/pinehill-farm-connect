
import React from "react";
import { AdminEmployeeScheduleCard } from "@/components/time-management/work-schedule/AdminEmployeeScheduleCard";
import { EmployeeScheduleCard } from "@/components/time-management/work-schedule/EmployeeScheduleCard";

interface DashboardScheduleSectionProps {
  isAdmin: boolean;
  scheduleData: any;
  scheduleLoading: boolean;
  viewAllUrl?: string;
}

export const DashboardScheduleSection: React.FC<DashboardScheduleSectionProps> = ({
  isAdmin,
  scheduleData,
  scheduleLoading,
  viewAllUrl
}) => {
  return (
    <div className="md:col-span-2">
      {isAdmin ? (
        <AdminEmployeeScheduleCard clickable={true} viewAllUrl={viewAllUrl} />
      ) : (
        <EmployeeScheduleCard 
          schedule={scheduleData}
          loading={scheduleLoading}
          clickable={true}
          viewAllUrl={viewAllUrl}
        />
      )}
    </div>
  );
};
