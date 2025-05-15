
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getDateKey } from "./utils/calendarDateUtils";
import { CalendarEventMap } from "./utils/calendarDateUtils";
import { format } from "date-fns";

interface CalendarDayContentProps {
  day: Date;
  eventsMap: Map<string, CalendarEventMap>;
}

export const CalendarDayContent: React.FC<CalendarDayContentProps> = ({ 
  day, 
  eventsMap 
}) => {
  if (!day) {
    console.warn("CalendarDayContent received null day");
    return null;
  }
  
  const dateKey = getDateKey(day);
  const events = eventsMap.get(dateKey);
  
  // Debug log day and events
  console.log(`CalendarDayContent for ${format(day, "dd-MM")}: has events: ${!!events}`);

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 p-1">
      {events?.timeOff?.length > 0 && (
        <Badge variant="outline" className="bg-blue-100 text-xs px-1">Time Off</Badge>
      )}
      {events?.shifts?.length > 0 && (
        <Badge variant="outline" className="bg-green-100 text-xs px-1">Shift</Badge>
      )}
      {events?.shiftCoverage?.length > 0 && (
        <Badge variant="outline" className="bg-amber-100 text-xs px-1">Coverage</Badge>
      )}
    </div>
  );
};
