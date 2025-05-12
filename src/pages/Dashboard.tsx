
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

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <DashboardHeader userName={currentUser?.name || ''} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Priority alert for admins - full width */}
          {isAdmin && pendingTimeOff && (
            <div className="col-span-full">
              <AdminTimeOffCard count={pendingTimeOff.length || 0} />
            </div>
          )}

          {/* Left column - Calendar */}
          <div className="md:col-span-3">
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
          
          {/* Right column - Marketing content */}
          <div className="md:col-span-1">
            <MarketingContent />
          </div>
          
          {/* Full width trainings section if applicable */}
          {assignedTrainings && assignedTrainings.length > 0 && (
            <div className="col-span-full">
              <TrainingCard trainings={assignedTrainings} />
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
              />
            </div>
          )}

          {/* Announcements section */}
          {announcements && announcements.length > 0 && (
            <>
              <div className="md:col-span-2">
                <AnnouncementsCard announcements={announcements} />
              </div>
              {isAdmin && (
                <div className="md:col-span-2">
                  <AnnouncementStats />
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
