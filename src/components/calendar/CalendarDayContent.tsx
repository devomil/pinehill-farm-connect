
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getDateKey } from "./utils/calendarDateUtils";
import { CalendarEventMap } from "./utils/calendarDateUtils";
import { format } from "date-fns";
import { Clock, Calendar as CalendarIcon, User } from "lucide-react";

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

  // If there are no events at all, return null
  if (!events) return null;

  // Get counts for each event type
  const timeOffCount = events.timeOff?.length || 0;
  const shiftsCount = events.shifts?.length || 0;
  const coverageCount = events.shiftCoverage?.length || 0;
  
  // Color the entire day if it's a full day off
  const isFullDayOff = timeOffCount > 0 && shiftsCount === 0;
  
  // Generate day class based on events
  const getDayClassName = () => {
    if (isFullDayOff) return "bg-red-50 rounded-sm absolute inset-0 z-0";
    return "";
  };

  return (
    <>
      {/* Background for full day off */}
      {isFullDayOff && <div className={getDayClassName()} />}
      
      {/* Event indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 p-1 z-10">
        {timeOffCount > 0 && (
          <Badge variant="outline" className="bg-blue-100 text-xs px-1 flex items-center gap-1">
            <CalendarIcon className="h-2 w-2" />
            <span>{timeOffCount > 1 ? timeOffCount : ""}</span>
          </Badge>
        )}
        {shiftsCount > 0 && (
          <Badge variant="outline" className="bg-green-100 text-xs px-1 flex items-center gap-1">
            <Clock className="h-2 w-2" />
            <span>{shiftsCount > 1 ? shiftsCount : ""}</span>
          </Badge>
        )}
        {coverageCount > 0 && (
          <Badge variant="outline" className="bg-amber-100 text-xs px-1 flex items-center gap-1">
            <User className="h-2 w-2" />
            <span>{coverageCount > 1 ? coverageCount : ""}</span>
          </Badge>
        )}
      </div>
    </>
  );
};
