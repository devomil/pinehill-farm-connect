
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRange } from "react-day-picker";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";

interface CommunicationFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const CommunicationFilter: React.FC<CommunicationFilterProps> = ({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="fyi">FYI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date Range</Label>
          <CalendarDateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
          />
        </div>
      </div>
    </div>
  );
};
