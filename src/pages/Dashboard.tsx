
import React, { useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminTimeOffCard } from "@/components/dashboard/AdminTimeOffCard";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { TimeOffRequestsCard } from "@/components/dashboard/TimeOffRequestsCard";
import { ShiftCoverageCard } from "@/components/dashboard/shift-coverage";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";
import { MarketingContent } from "@/components/dashboard/MarketingContent";
import { useDashboardData } from "@/hooks/useDashboardData";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { AnnouncementStats } from "@/components/dashboard/AnnouncementStats";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EmployeeScheduleCard } from "@/components/time-management/work-schedule/EmployeeScheduleCard";
import { useWorkSchedule } from "@/components/time-management/work-schedule/useWorkSchedule";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { 
    pendingTimeOff,
    userTimeOff,
    shiftCoverageMessages,
    announcements,
    assignedTrainings,
    isAdmin,
    refetchData,
    loading: dashboardDataLoading,
    error: dashboardDataError,
    handleRefreshData
  } = useDashboardData();

  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "team">("month");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const navigate = useNavigate();

  // Get work schedule for the employee
  const { scheduleData, loading: scheduleLoading } = useWorkSchedule(
    currentUser?.id || null
  );

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Navigation handlers for dashboard widgets
  const handleTimeOffClick = () => {
    navigate("/time?tab=my-requests");
  };

  const handleTrainingClick = () => {
    navigate("/training");
  };

  const handleAnnouncementsClick = () => {
    navigate("/communication?tab=announcements");
  };

  const handleCalendarClick = () => {
    navigate("/calendar");
  };

  const handleAdminTimeOffClick = () => {
    navigate("/time?tab=pending-approvals");
  };

  const handleScheduleClick = () => {
    navigate("/time?tab=work-schedules");
  };

  const handleMarketingClick = () => {
    navigate("/marketing");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <DashboardHeader userName={currentUser?.name || ''} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Priority alert for admins - full width */}
          {isAdmin && pendingTimeOff && (
            <div className="col-span-full" onClick={handleAdminTimeOffClick}>
              <AdminTimeOffCard count={pendingTimeOff.length || 0} clickable={true} viewAllUrl="/time?tab=pending-approvals" />
            </div>
          )}

          {/* Left column - Calendar */}
          <div className="md:col-span-3" onClick={handleCalendarClick}>
            <CalendarContent
              date={date}
              currentMonth={currentMonth}
              viewMode={viewMode}
              currentUser={currentUser}
              onDateSelect={(newDate) => newDate && setDate(newDate)}
              onViewModeChange={setViewMode}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              clickable={true}
              viewAllUrl="/calendar"
            />
          </div>
          
          {/* Right column - Marketing content */}
          <div className="md:col-span-1">
            <MarketingContent viewAllUrl="/marketing" onViewAllClick={handleMarketingClick} />
          </div>
          
          {/* Full width trainings section if applicable */}
          {assignedTrainings && assignedTrainings.length > 0 && (
            <div className="col-span-full" onClick={handleTrainingClick}>
              <TrainingCard trainings={assignedTrainings} clickable={true} viewAllUrl="/training" />
            </div>
          )}

          {/* Admin time off requests */}
          {isAdmin && (
            <div className="md:col-span-2" onClick={handleTimeOffClick}>
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
            <div className="md:col-span-2" onClick={handleTimeOffClick}>
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

          {/* Work Schedule Card */}
          {!isAdmin && currentUser && (
            <div className="md:col-span-2" onClick={handleScheduleClick}>
              <EmployeeScheduleCard 
                schedule={scheduleData}
                loading={scheduleLoading}
                clickable={true}
                viewAllUrl="/time?tab=work-schedules"
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

          {/* Announcements section */}
          {announcements && announcements.length > 0 && (
            <>
              <div className="md:col-span-2" onClick={handleAnnouncementsClick}>
                <AnnouncementsCard announcements={announcements} clickable={true} viewAllUrl="/communication?tab=announcements" />
              </div>
              {isAdmin && (
                <div className="md:col-span-2" onClick={handleAnnouncementsClick}>
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
    </DashboardLayout>
  );
}
