
import React from "react";
import { AdminTimeOffCard } from "@/components/dashboard/AdminTimeOffCard";
import { TimeOffRequestsCard } from "@/components/dashboard/TimeOffRequestsCard";

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
  return (
    <div className="md:col-span-1">
      {isAdmin ? (
        <AdminTimeOffCard
          requests={pendingTimeOff || []}
          loading={dashboardDataLoading}
          error={dashboardDataError}
          onRefresh={handleRefreshData}
          clickable={true}
          viewAllUrl={viewAllUrl}
        />
      ) : (
        <TimeOffRequestsCard
          requests={userTimeOff || []}
          loading={dashboardDataLoading}
          error={dashboardDataError}
          onRefresh={handleRefreshData}
          clickable={true}
          viewAllUrl={viewAllUrl}
        />
      )}
    </div>
  );
};
