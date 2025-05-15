
import React from "react";
import { CalendarDayContent } from "./CalendarDayContent";
import { extractHTMLAttributes } from "./utils/calendarDateUtils";
import { CalendarEventMap } from "./utils/calendarDateUtils";
import { format, isValid } from "date-fns";

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
  
  // Debug logging
  if (dayDate && isValid(dayDate)) {
    console.log("CalendarDay rendering date:", format(dayDate, "yyyy-MM-dd"));
  } else if (dayDate) {
    console.error("CalendarDay received invalid date:", dayDate);
  }

  if (!dayDate || !isValid(dayDate)) {
    return <div {...safeHtmlProps} className="border border-dashed border-gray-200 h-full" />;
  }

  // The eventsMap should be passed via context or props
  const eventsMap: Map<string, CalendarEventMap> = props.eventsMap || new Map();
  
  return (
    <div className="relative h-full">
      <div {...safeHtmlProps}>
        {/* Day number is shown with higher z-index to ensure visibility */}
        <div className="text-sm font-medium relative z-10">
          {format(dayDate, "d")}
        </div>
      </div>
      <CalendarDayContent day={dayDate} eventsMap={eventsMap} />
    </div>
  );
};
