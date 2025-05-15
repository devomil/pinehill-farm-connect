
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
  
  return (
    <div className="md:col-span-2">
      {isAdmin ? (
        <AdminEmployeeScheduleCard 
          clickable={true} 
          viewAllUrl={viewAllUrl} 
          emptyState={<ScheduleEmptyState isAdmin={true} onManageSchedule={handleManageSchedule} />}
        />
      ) : (
        <EmployeeScheduleCard 
          schedule={scheduleData}
          loading={scheduleLoading}
          clickable={true}
          viewAllUrl={viewAllUrl}
          emptyState={<ScheduleEmptyState />}
        />
      )}
    </div>
  );
};
