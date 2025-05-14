
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
}

export const DashboardTimeOffSection: React.FC<DashboardTimeOffSectionProps> = ({
  isAdmin,
  pendingTimeOff,
  userTimeOff,
  dashboardDataLoading,
  dashboardDataError,
  handleRefreshData,
}) => {
  return (
    <>
      {/* Priority alert for admins - full width */}
      {isAdmin && pendingTimeOff && (
        <div className="col-span-full">
          <AdminTimeOffCard count={pendingTimeOff.length || 0} clickable={true} viewAllUrl="/time?tab=pending-approvals" />
        </div>
      )}
      
      {/* Time off requests section */}
      <div className="md:col-span-2">
        {isAdmin ? (
          <TimeOffRequestsCard 
            requests={pendingTimeOff || []} 
            loading={dashboardDataLoading}
            error={dashboardDataError}
            onRefresh={handleRefreshData}
            showEmployeeName={true}
            clickable={true}
            viewAllUrl="/time?tab=pending-approvals"
          />
        ) : (
          <TimeOffRequestsCard 
            requests={userTimeOff || []} 
            loading={dashboardDataLoading}
            error={dashboardDataError}
            onRefresh={handleRefreshData}
            clickable={true}
            viewAllUrl="/time?tab=my-requests"
          />
        )}
      </div>
    </>
  );
};
