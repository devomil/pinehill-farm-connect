
import React from "react";
import { ShiftCoverageCard } from "@/components/dashboard/shift-coverage/ShiftCoverageCard";
import { User } from "@/types";

interface DashboardShiftCoverageSectionProps {
  shiftCoverageMessages: any[] | null;
  currentUser: User;
  dashboardDataLoading: boolean;
  dashboardDataError: Error | null;
  handleRefreshData: () => void;
  viewAllUrl?: string;
}

export const DashboardShiftCoverageSection: React.FC<DashboardShiftCoverageSectionProps> = ({
  shiftCoverageMessages,
  currentUser,
  dashboardDataLoading,
  dashboardDataError,
  handleRefreshData,
  viewAllUrl
}) => {
  return (
    <div className="md:col-span-2">
      <ShiftCoverageCard
        messages={shiftCoverageMessages || []}
        currentUser={currentUser}
        loading={dashboardDataLoading}
        error={dashboardDataError}
        onRefresh={handleRefreshData}
        clickable={true}
        viewAllUrl={viewAllUrl}
      />
    </div>
  );
};
