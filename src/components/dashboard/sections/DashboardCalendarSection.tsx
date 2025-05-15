
import React from "react";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { User } from "@/types";
import { CalendarEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";

interface DashboardCalendarSectionProps {
  date: Date;
  currentMonth: Date;
  viewMode: "month" | "team";
  currentUser: User;
  onDateSelect: (date: Date | undefined) => void;
  onViewModeChange: (value: "month" | "team") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  viewAllUrl?: string;
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
  const navigate = useNavigate();
  // Debug log the current props
  console.log("DashboardCalendarSection - props:", {
    date: date?.toISOString(),
    currentMonth: currentMonth?.toISOString(),
    viewMode
  });
  
  const handleAddEvent = () => {
    navigate("/time?tab=team-calendar&action=new");
  };
  
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
        emptyState={<CalendarEmptyState onAddEvent={handleAddEvent} />}
      />
    </div>
  );
};
