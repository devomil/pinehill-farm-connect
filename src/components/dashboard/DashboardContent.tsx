
import React from "react";
import { User } from "@/types";
import { DashboardCalendarSection } from "@/components/dashboard/sections/DashboardCalendarSection";
import { DashboardScheduleSection } from "@/components/dashboard/sections/DashboardScheduleSection";
import { DashboardTimeOffSection } from "@/components/dashboard/sections/DashboardTimeOffSection";
import { DashboardShiftCoverageSection } from "@/components/dashboard/sections/DashboardShiftCoverageSection";
import { DashboardAnnouncementsSection } from "@/components/dashboard/sections/DashboardAnnouncementsSection";
import { DashboardTrainingSection } from "@/components/dashboard/sections/DashboardTrainingSection";
import { DashboardMarketingSection } from "@/components/dashboard/sections/DashboardMarketingSection";

interface DashboardContentProps {
  isAdmin: boolean;
  pendingTimeOff: any[] | null;
  userTimeOff: any[] | null;
  shiftCoverageMessages: any[] | null;
  announcements: any[] | null;
  assignedTrainings: any[] | null;
  currentUser: User;
  scheduleData: any;
  scheduleLoading: boolean;
  date: Date;
  currentMonth: Date;
  viewMode: "month" | "team";
  dashboardDataLoading: boolean;
  dashboardDataError: Error | null;
  handleRefreshData: () => void;
  onDateSelect: (date: Date | undefined) => void;
  onViewModeChange: (value: "month" | "team") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  isAdmin,
  pendingTimeOff,
  userTimeOff,
  shiftCoverageMessages,
  announcements,
  assignedTrainings,
  currentUser,
  scheduleData,
  scheduleLoading,
  date,
  currentMonth,
  viewMode,
  dashboardDataLoading,
  dashboardDataError,
  handleRefreshData,
  onDateSelect,
  onViewModeChange,
  onPreviousMonth,
  onNextMonth,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Time Off Section */}
        <DashboardTimeOffSection 
          isAdmin={isAdmin}
          pendingTimeOff={pendingTimeOff}
          userTimeOff={userTimeOff}
          dashboardDataLoading={dashboardDataLoading}
          dashboardDataError={dashboardDataError}
          handleRefreshData={handleRefreshData}
          viewAllUrl="/time?tab=my-requests"
        />

        {/* Calendar Section */}
        <DashboardCalendarSection 
          date={date}
          currentMonth={currentMonth}
          viewMode={viewMode}
          currentUser={currentUser}
          onDateSelect={onDateSelect}
          onViewModeChange={onViewModeChange}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
        />
        
        {/* Schedule Section */}
        <DashboardScheduleSection
          isAdmin={isAdmin}
          scheduleData={scheduleData}
          scheduleLoading={scheduleLoading}
          viewAllUrl="/time?tab=work-schedules"
        />
        
        {/* Training Section */}
        <DashboardTrainingSection 
          assignedTrainings={assignedTrainings}
          viewAllUrl="/training"
        />

        {/* Shift Coverage Section */}
        {currentUser && (
          <DashboardShiftCoverageSection
            shiftCoverageMessages={shiftCoverageMessages}
            currentUser={currentUser}
            dashboardDataLoading={dashboardDataLoading}
            dashboardDataError={dashboardDataError}
            handleRefreshData={handleRefreshData}
            viewAllUrl="/time?tab=shift-coverage"
          />
        )}

        {/* Marketing Section */}
        <DashboardMarketingSection 
          viewAllUrl="/marketing"
        />

        {/* Announcements Section */}
        <DashboardAnnouncementsSection
          announcements={announcements}
          isAdmin={isAdmin}
          viewAllUrl="/communication?tab=announcements"
        />
      </div>
    </div>
  );
};
