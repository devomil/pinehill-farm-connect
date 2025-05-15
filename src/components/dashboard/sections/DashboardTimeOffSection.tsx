
import React from "react";
import { AdminTimeOffCard } from "@/components/dashboard/AdminTimeOffCard";
import { TimeOffRequestsCard } from "@/components/dashboard/TimeOffRequestsCard";
import { TimeOffEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";

interface DashboardTimeOffSectionProps {
  isAdmin: boolean;
  pendingTimeOff: any[] | null;
  userTimeOff: any[] | null;
  dashboardDataLoading: boolean;
  dashboardDataError: Error | null;
  handleRefreshData: () => void;
  viewAllUrl?: string;
}

export const DashboardTimeOffSection: React.FC<DashboardTimeOffSectionProps> = ({
  isAdmin,
  pendingTimeOff,
  userTimeOff,
  dashboardDataLoading,
  dashboardDataError,
  handleRefreshData,
  viewAllUrl
}) => {
  const navigate = useNavigate();
  
  const handleNewRequest = () => {
    navigate("/time?tab=my-requests&action=new");
  };
  
  return (
    <div className="md:col-span-2">
      {isAdmin ? (
        <AdminTimeOffCard
          timeOffRequests={pendingTimeOff || []}
          loading={dashboardDataLoading}
          error={dashboardDataError}
          onRefresh={handleRefreshData}
          clickable={true}
          viewAllUrl={viewAllUrl}
          emptyState={<TimeOffEmptyState isAdmin={true} />}
        />
      ) : (
        <TimeOffRequestsCard
          timeOffRequests={userTimeOff || []}
          loading={dashboardDataLoading}
          error={dashboardDataError}
          onRefresh={handleRefreshData}
          clickable={true} 
          viewAllUrl={viewAllUrl}
          emptyState={<TimeOffEmptyState onNewRequest={handleNewRequest} />}
        />
      )}
    </div>
  );
};
