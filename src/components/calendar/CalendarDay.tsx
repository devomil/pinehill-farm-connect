
import React from "react";
import { CalendarDayContent } from "./CalendarDayContent";
import { extractHTMLAttributes } from "./utils/calendarDateUtils";
import { CalendarEventMap } from "./utils/calendarDateUtils";
import { format } from "date-fns";

interface CalendarDayProps {
  date?: Date;
  // We need to accept any props that might come from the Calendar component
  [x: string]: any;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ 
  date: dayDate, 
  ...props 
}) => {
  // Extract only valid HTML attributes for the div
  const safeHtmlProps = extractHTMLAttributes(props);
  
  // Debugging: Log the day date to verify it's being passed correctly
  if (dayDate) {
    console.log("CalendarDay rendering date:", format(dayDate, "yyyy-MM-dd"));
  } else {
    console.log("CalendarDay: Missing date");
  }

  if (!dayDate) {
    return <div {...safeHtmlProps} />;
  }

  // The eventsMap should be passed via context or props
  const eventsMap: Map<string, CalendarEventMap> = props.eventsMap || new Map();
  
  return (
    <div className="relative h-full">
      <div {...safeHtmlProps}>
        {/* Make sure the day number is visible */}
        <div className="text-sm font-medium">{format(dayDate, "d")}</div>
      </div>
      <CalendarDayContent day={dayDate} eventsMap={eventsMap} />
    </div>
  );
};
