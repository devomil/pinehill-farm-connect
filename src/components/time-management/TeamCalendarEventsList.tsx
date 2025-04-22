
import React from "react";
import { Calendar as CalendarIcon, Clock, Paperclip, Check, ThumbsUp, CircleDot, Info } from "lucide-react";

export interface CalendarItem {
  id: string;
  type: "timeoff" | "event";
  label: string;
  status?: "pending" | "approved" | "rejected";
  startDate: Date;
  endDate: Date;
  attachments?: string[];
  attendanceType?: "required" | "optional" | "would-like" | "info-only";
}

interface TeamCalendarEventsListProps {
  calendarItems: CalendarItem[];
  selectedDate: Date | null;
  loading: boolean;
}

function getAttendanceIcon(type: string | undefined) {
  switch(type) {
    case "required": return <Check className="h-4 w-4 text-red-500" />;
    case "would-like": return <ThumbsUp className="h-4 w-4 text-blue-500" />;
    case "optional": return <CircleDot className="h-4 w-4 text-green-500" />;
    case "info-only": return <Info className="h-4 w-4 text-gray-500" />;
    default: return null;
  }
}

export const TeamCalendarEventsList: React.FC<TeamCalendarEventsListProps> = ({
  calendarItems,
  selectedDate,
  loading,
}) => {
  return (
    <div>
      <h4 className="font-semibold mb-2">
        {selectedDate 
          ? `Events for ${selectedDate.toLocaleDateString()}` 
          : "Upcoming Events"}
      </h4>
      {calendarItems.length === 0 &&
        <div className="text-center text-muted-foreground">No team time off or events scheduled.</div>
      }
      <ul className="space-y-3">
        {calendarItems
          .filter(item => !selectedDate || 
            (item.startDate <= selectedDate && item.endDate >= selectedDate))
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
          .map((item) => (
            <li key={item.type + "-" + item.id} className="border p-2 rounded-md hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                {item.type === "event" ? (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                    <span>
                      <span className="font-medium">{item.label}</span>
                      <div className="flex items-center space-x-1 text-xs">
                        {getAttendanceIcon(item.attendanceType)}
                        <span className="text-muted-foreground">
                          {item.startDate.toLocaleDateString()}{" "}
                          {item.endDate > item.startDate
                            ? `— ${item.endDate.toLocaleDateString()}`
                            : ""}
                        </span>
                        {item.attachments && item.attachments.length > 0 && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4"
                      style={{
                        color:
                          item.status === "approved"
                            ? "#16a34a"
                            : item.status === "pending"
                            ? "#f59e42"
                            : "#ef4444"
                      }}
                    />
                    <span>
                      <span className="font-medium">{item.label}</span>
                      <div className="text-xs text-muted-foreground">
                        {item.startDate.toLocaleDateString()}{" "}
                        {item.endDate > item.startDate
                          ? `— ${item.endDate.toLocaleDateString()}`
                          : ""}
                      </div>
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};
