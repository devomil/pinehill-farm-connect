
import React from "react";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { User } from "@/types";
import { CalendarEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  
  const handleAddEvent = () => {
    navigate("/time?tab=team-calendar&action=new");
  };
  
  // Check if calendar has events (this would need to be properly implemented)
  const hasEvents = true; // This is a placeholder - you would typically check if there are events
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Team Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        {hasEvents ? (
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
        ) : (
          <CalendarEmptyState onAddEvent={handleAddEvent} />
        )}
      </CardContent>
    </Card>
  );
};
