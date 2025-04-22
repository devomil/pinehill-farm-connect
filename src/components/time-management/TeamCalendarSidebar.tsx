
import React from "react";
import { Calendar as DayCalendar } from "@/components/ui/calendar";
import { TeamCalendarEventsList } from "./TeamCalendarEventsList";
import { CalendarItem } from "./TeamCalendar.types";

interface TeamCalendarSidebarProps {
  calendarHighlightDays: Date[];
  calendarItems: CalendarItem[];
  selectedDate: Date | null;
  loading: boolean;
  onDateSelect: (date: Date | undefined) => void;
}

export const TeamCalendarSidebar: React.FC<TeamCalendarSidebarProps> = ({
  calendarHighlightDays,
  calendarItems,
  selectedDate,
  loading,
  onDateSelect
}) => (
  <div className="flex flex-col md:flex-row md:space-x-8">
    <div className="flex-1">
      <DayCalendar
        mode="multiple"
        selected={calendarHighlightDays}
        modifiersClassNames={{
          selected: "bg-blue-400 text-white !opacity-100"
        }}
        className="border border-muted rounded-md"
        showOutsideDays
        onDayClick={onDateSelect}
      />
    </div>
    <div className="flex-1 mt-6 md:mt-0">
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <TeamCalendarEventsList
          calendarItems={calendarItems}
          selectedDate={selectedDate}
          loading={loading}
        />
      )}
    </div>
  </div>
);

