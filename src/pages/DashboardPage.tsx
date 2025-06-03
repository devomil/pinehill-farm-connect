
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useWorkSchedule } from "@/components/time-management/work-schedule/hooks/useWorkSchedule";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useDashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { useDashboardNavigation } from "@/components/dashboard/DashboardNavigationHandlers";
import { TimeManagementProvider } from "@/contexts/timeManagement";
import { PageContainer } from "@/components/ui/page-container";
import "@/components/dashboard/DashboardGrid.css";

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    pendingTimeOff,
    userTimeOff,
    shiftCoverageMessages,
    announcements,
    assignedTrainings,
    isAdmin,
    loading: dashboardDataLoading,
    error: dashboardDataError,
    handleRefreshData
  } = useDashboardData();

  // Get calendar state and handlers
  const {
    date,
    viewMode,
    currentMonth,
    handleDateSelect,
    setViewMode,
    goToPreviousMonth,
    goToNextMonth
  } = useDashboardCalendar();

  // Get navigation handlers
  const navigationHandlers = useDashboardNavigation();

  // Get work schedule for the employee
  const { scheduleData, loading: scheduleLoading } = useWorkSchedule(
    currentUser?.id || null
  );

  return (
    <DashboardLayout>
      <PageContainer maxWidth="full" padding="none">
        <div className="space-y-6">
          <DashboardHeader userName={currentUser?.name || ''} />
          
          <TimeManagementProvider currentUser={currentUser}>
            <DashboardContent
              isAdmin={isAdmin}
              pendingTimeOff={pendingTimeOff}
              userTimeOff={userTimeOff}
              shiftCoverageMessages={shiftCoverageMessages}
              announcements={announcements}
              assignedTrainings={assignedTrainings}
              currentUser={currentUser!}
              scheduleData={scheduleData}
              scheduleLoading={scheduleLoading}
              date={date}
              currentMonth={currentMonth}
              viewMode={viewMode}
              dashboardDataLoading={dashboardDataLoading}
              dashboardDataError={dashboardDataError}
              handleRefreshData={handleRefreshData}
              onDateSelect={handleDateSelect}
              onViewModeChange={setViewMode}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
            />
          </TimeManagementProvider>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default DashboardPage;
