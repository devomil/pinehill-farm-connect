
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminTimeOffCard } from "@/components/dashboard/AdminTimeOffCard";
import { TrainingCard } from "@/components/dashboard/TrainingCard";
import { TimeOffRequestsCard } from "@/components/dashboard/TimeOffRequestsCard";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { DashboardAlert } from "@/components/dashboard/DashboardAlert";
import { SocialMediaFeeds } from "@/components/dashboard/SocialMediaFeeds";
import { MarketingContent } from "@/components/dashboard/MarketingContent";
import { useDashboardData } from "@/hooks/useDashboardData";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { AnnouncementStats } from "@/components/dashboard/AnnouncementStats";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { 
    pendingTimeOff,
    userTimeOff,
    announcements,
    assignedTrainings,
    isAdmin 
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

            {userTimeOff && userTimeOff.length > 0 && (
              <TimeOffRequestsCard requests={userTimeOff} />
            )}

            {announcements && announcements.length > 0 && (
              <AnnouncementsCard announcements={announcements} />
            )}
          </div>

          {isAdmin && (
            <div className="space-y-4">
              <AnnouncementStats />
            </div>
          )}
        </div>

        {assignedTrainings && assignedTrainings.length > 0 && (
          <DashboardAlert trainingCount={assignedTrainings.length} />
        )}
      </div>
    </DashboardLayout>
  );
}

