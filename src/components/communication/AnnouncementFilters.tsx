
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface AnnouncementFiltersProps {
  onSearchChange: (search: string) => void;
  onPriorityChange: (priority: string) => void;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export function AnnouncementFilters({
  onSearchChange,
  onPriorityChange,
  onDateRangeChange
}: AnnouncementFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onDateRangeChange(range);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Search</label>
        <Input 
          placeholder="Search announcements..." 
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Priority</label>
        <Select onValueChange={onPriorityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="fyi">FYI</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Date Range</label>
        <CalendarDateRangePicker 
          value={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>
    </div>
  );
}
