
import React from "react";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { User } from "@/types";

interface DashboardCalendarSectionProps {
  date: Date;
  currentMonth: Date;
  viewMode: "month" | "team";
  currentUser: User;
  onDateSelect: (date: Date | undefined) => void;
  onViewModeChange: (value: "month" | "team") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  viewAllUrl?: string; // Added the missing prop
}

export const DashboardCalendarSection: React.FC<DashboardCalendarSectionProps> = ({
  date,
  currentMonth,
  viewMode,
  currentUser,
  onDateSelect,
  onViewModeChange,
  onPreviousMonth,
  onNextMonth,
  viewAllUrl,
}) => {
  // Debug log the current props
  console.log("DashboardCalendarSection - props:", {
    date: date?.toISOString(),
    currentMonth: currentMonth?.toISOString(),
    viewMode
  });
  
  // The TimeManagementProvider is now at the Dashboard page level
  return (
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
        viewAllUrl={viewAllUrl}
      />
    </div>
  );
};
