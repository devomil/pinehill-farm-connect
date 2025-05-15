
import React from "react";
import { CalendarDayContent } from "./CalendarDayContent";
import { extractHTMLAttributes } from "./utils/calendarDateUtils";
import { CalendarEventMap } from "./utils/calendarDateUtils";

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
  
  if (!dayDate) {
    return <div {...safeHtmlProps} />;
  }

  // The eventsMap should be passed via context or props
  // For now, we'll assume it's in the props
  const eventsMap: Map<string, CalendarEventMap> = props.eventsMap || new Map();
  
  return (
    <div className="relative h-full">
      <div {...safeHtmlProps} />
      <CalendarDayContent day={dayDate} eventsMap={eventsMap} />
    </div>
  );
};
