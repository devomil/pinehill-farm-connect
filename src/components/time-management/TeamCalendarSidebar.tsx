
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarItem } from "./TeamCalendar.types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List } from "lucide-react";

interface TeamCalendarSidebarProps {
  calendarItems: CalendarItem[];
  selectedDate: Date | null;
  loading: boolean;
  onDateSelect: (date: Date | undefined) => void;
  calendarHighlightDays: Date[];
  includeDeclinedRequests: boolean;
  setIncludeDeclinedRequests: (include: boolean) => void;
}

export const TeamCalendarSidebar: React.FC<TeamCalendarSidebarProps> = ({
  calendarItems,
  selectedDate,
  loading,
  onDateSelect,
  calendarHighlightDays,
  includeDeclinedRequests,
  setIncludeDeclinedRequests
}) => {
  // Get items for the selected date
  const selectedDateItems = selectedDate
    ? calendarItems.filter((item) => {
        const itemStart = new Date(item.startDate);
        const itemEnd = new Date(item.endDate);
        const selected = new Date(selectedDate);
        
        // Set times to midnight for date comparison
        itemStart.setHours(0, 0, 0, 0);
        itemEnd.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);
        
        return selected >= itemStart && selected <= itemEnd;
      })
    : [];
    
  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2 mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeDeclined"
            checked={includeDeclinedRequests}
            onChange={(e) => setIncludeDeclinedRequests(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="includeDeclined" className="text-sm text-muted-foreground">
            Include declined
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={onDateSelect}
              disabled={loading}
              modifiers={{
                highlighted: calendarHighlightDays
              }}
              modifiersStyles={{
                highlighted: { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
              }}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <h3 className="bg-slate-50 font-medium p-3 border-b">
              Company Events
            </h3>
            {loading ? (
              <div className="p-4 text-center text-slate-500">Loading events...</div>
            ) : selectedDateItems.length > 0 ? (
              <div className="divide-y">
                {selectedDateItems.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-slate-50">
                    <p className="font-medium">{item.label}</p>
                    <div className="text-sm text-slate-500 flex justify-between">
                      <span>
                        {new Date(item.startDate).toLocaleDateString()} 
                        {item.endDate && item.endDate !== item.startDate ? 
                          ` - ${new Date(item.endDate).toLocaleDateString()}` : ''}
                      </span>
                      {item.attendanceType && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {item.attendanceType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500">
                {selectedDate 
                  ? "No events for the selected date" 
                  : "Select a date to view events"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
