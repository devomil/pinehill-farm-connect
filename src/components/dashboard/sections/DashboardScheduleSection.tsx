
import React from "react";
import { AdminEmployeeScheduleCard } from "@/components/time-management/work-schedule/AdminEmployeeScheduleCard";
import { EmployeeScheduleCard } from "@/components/time-management/work-schedule/EmployeeScheduleCard";
import { ScheduleEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  const handleManageSchedule = () => {
    navigate("/time?tab=work-schedules");
  };
  
  const hasSchedule = scheduleData && Object.keys(scheduleData).length > 0;
  
  return (
    <div className="md:col-span-2">
      {isAdmin ? (
        hasSchedule ? (
          <AdminEmployeeScheduleCard 
            clickable={true} 
            viewAllUrl={viewAllUrl} 
          />
        ) : (
          <ScheduleEmptyState isAdmin={true} onManageSchedule={handleManageSchedule} />
        )
      ) : (
        hasSchedule ? (
          <EmployeeScheduleCard 
            schedule={scheduleData}
            loading={scheduleLoading}
            clickable={true}
            viewAllUrl={viewAllUrl}
          />
        ) : (
          <ScheduleEmptyState />
        )
      )}
    </div>
  );
};
