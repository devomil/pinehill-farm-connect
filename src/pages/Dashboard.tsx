
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminTimeOffCard } from "@/components/dashboard/AdminTimeOffCard";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { TimeOffRequestsCard } from "@/components/dashboard/TimeOffRequestsCard";
import { ShiftCoverageCard } from "@/components/dashboard/ShiftCoverageCard";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";
import { SocialMediaFeeds } from "@/components/dashboard/SocialMediaFeeds";
import { MarketingContent } from "@/components/dashboard/MarketingContent";
import { useDashboardData } from "@/hooks/useDashboardData";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { useState, useCallback, useEffect } from "react";
import { addMonths, subMonths } from "date-fns";
import { AnnouncementStats } from "@/components/dashboard/AnnouncementStats";

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
    error: dashboardDataError 
  } = useDashboardData();

  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "team">("month");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Add auto-refresh logic for dashboard data
  useEffect(() => {
    console.log("Setting up dashboard auto-refresh");
    
    // Initial fetch
    refetchData();
    
    // Auto refresh every 30 seconds
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing dashboard data");
      refetchData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [refetchData]);
  
  // Log shift coverage data for debugging
  useEffect(() => {
    console.log("Dashboard shift coverage messages:", shiftCoverageMessages?.length || 0);
    
    if (shiftCoverageMessages && shiftCoverageMessages.length > 0) {
      console.log("Sample shift message:", {
        id: shiftCoverageMessages[0].id,
        type: shiftCoverageMessages[0].type,
        sender: shiftCoverageMessages[0].sender_id,
        recipient: shiftCoverageMessages[0].recipient_id,
        hasRequests: shiftCoverageMessages[0].shift_coverage_requests?.length > 0,
        status: shiftCoverageMessages[0].shift_coverage_requests?.[0]?.status
      });
    }
  }, [shiftCoverageMessages]);

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleRefreshData = useCallback(() => {
    console.log("Manual dashboard refresh triggered");
    refetchData();
  }, [refetchData]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <DashboardHeader userName={currentUser?.name || ''} />

        {isAdmin && pendingTimeOff && (
          <AdminTimeOffCard count={pendingTimeOff.length || 0} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CalendarContent
              date={date}
              currentMonth={currentMonth}
              viewMode={viewMode}
              currentUser={currentUser}
              onDateSelect={(newDate) => newDate && setDate(newDate)}
              onViewModeChange={setViewMode}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
            />
          </div>
          <div className="space-y-4">
            <MarketingContent />
            <SocialMediaFeeds />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {assignedTrainings && assignedTrainings.length > 0 && (
              <TrainingCard trainings={assignedTrainings} />
            )}

            {isAdmin && pendingTimeOff && (
              <TimeOffRequestsCard 
                requests={pendingTimeOff} 
                loading={dashboardDataLoading}
                error={dashboardDataError}
                onRefresh={handleRefreshData}
                showEmployeeName={true}
              />
            )}

            {userTimeOff && !isAdmin && (
              <TimeOffRequestsCard 
                requests={userTimeOff} 
                loading={dashboardDataLoading}
                error={dashboardDataError}
                onRefresh={handleRefreshData}
              />
            )}

            {/* Show Shift Coverage Card for both admins and employees */}
            {currentUser && shiftCoverageMessages && (
              <ShiftCoverageCard 
                messages={shiftCoverageMessages} 
                currentUser={currentUser}
                loading={dashboardDataLoading}
                error={dashboardDataError}
                onRefresh={handleRefreshData}
              />
            )}

            {announcements && announcements.length > 0 && (
              <>
                <AnnouncementsCard announcements={announcements} />
                {isAdmin && <AnnouncementStats />}
              </>
            )}
          </div>
        </div>

        {assignedTrainings && assignedTrainings.length > 0 && (
          <DashboardAlert trainingCount={assignedTrainings.length} />
        )}
      </div>
    </DashboardLayout>
  );
}
