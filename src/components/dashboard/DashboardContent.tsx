
import React from "react";
import { AdminTimeOffCard } from "@/components/dashboard/AdminTimeOffCard";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { TimeOffRequestsCard } from "@/components/dashboard/TimeOffRequestsCard";
import { ShiftCoverageCard } from "@/components/dashboard/shift-coverage";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";
import { MarketingContent } from "@/components/dashboard/MarketingContent";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { AnnouncementStats } from "@/components/dashboard/AnnouncementStats";
import { EmployeeScheduleCard } from "@/components/time-management/work-schedule/EmployeeScheduleCard";
import { AdminEmployeeScheduleCard } from "@/components/time-management/work-schedule/AdminEmployeeScheduleCard";
import { User } from "@/types";

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
        {/* Priority alert for admins - full width */}
        {isAdmin && pendingTimeOff && (
          <div className="col-span-full">
            <AdminTimeOffCard count={pendingTimeOff.length || 0} clickable={true} viewAllUrl="/time?tab=pending-approvals" />
          </div>
        )}

        {/* Left column - Calendar */}
        <div className="md:col-span-2">
          <CalendarContent
            date={date}
            currentMonth={currentMonth}
            viewMode={viewMode}
            currentUser={currentUser}
            onDateSelect={onDateSelect}
            onViewModeChange={onViewModeChange}
            onPreviousMonth={onPreviousMonth}
            onNextMonth={onNextMonth}
            clickable={true}
            viewAllUrl="/calendar"
          />
        </div>
        
        {/* Schedule cards - different view for admins vs employees */}
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
        
        {/* Full width trainings section if applicable */}
        {assignedTrainings && assignedTrainings.length > 0 && (
          <div className="col-span-full">
            <TrainingCard trainings={assignedTrainings} clickable={true} viewAllUrl="/training" />
          </div>
        )}

        {/* Admin time off requests */}
        {isAdmin && (
          <div className="md:col-span-2">
            <TimeOffRequestsCard 
              requests={pendingTimeOff || []} 
              loading={dashboardDataLoading}
              error={dashboardDataError}
              onRefresh={handleRefreshData}
              showEmployeeName={true}
              clickable={true}
              viewAllUrl="/time?tab=pending-approvals"
            />
          </div>
        )}

        {/* User time off requests */}
        {!isAdmin && (
          <div className="md:col-span-2">
            <TimeOffRequestsCard 
              requests={userTimeOff || []} 
              loading={dashboardDataLoading}
              error={dashboardDataError}
              onRefresh={handleRefreshData}
              clickable={true}
              viewAllUrl="/time?tab=my-requests"
            />
          </div>
        )}

        {/* Shift Coverage Card */}
        {currentUser && (
          <div className="md:col-span-2">
            <ShiftCoverageCard 
              messages={shiftCoverageMessages || []} 
              currentUser={currentUser}
              loading={dashboardDataLoading}
              error={dashboardDataError}
              onRefresh={handleRefreshData}
              clickable={true}
              viewAllUrl="/time?tab=shift-coverage"
            />
          </div>
        )}

        {/* Right column - Marketing content */}
        <div className="md:col-span-2">
          <MarketingContent viewAllUrl="/marketing" onViewAllClick={() => {}} />
        </div>

        {/* Announcements section */}
        {announcements && announcements.length > 0 && (
          <>
            <div className="md:col-span-2">
              <AnnouncementsCard announcements={announcements} clickable={true} viewAllUrl="/communication?tab=announcements" />
            </div>
            {isAdmin && (
              <div className="md:col-span-2">
                <AnnouncementStats clickable={true} viewAllUrl="/communication?tab=announcements" />
              </div>
            )}
          </>
        )}
      </div>

      {assignedTrainings && assignedTrainings.length > 0 && (
        <DashboardAlert trainingCount={assignedTrainings.length} />
      )}
    </div>
  );
};
