
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarViewSelectorProps {
  viewMode: "month" | "team";
  onViewModeChange: (value: "month" | "team") => void;
}

export function CalendarViewSelector({ viewMode, onViewModeChange }: CalendarViewSelectorProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <TabsList>
        <TabsTrigger value="month">Month</TabsTrigger>
        <TabsTrigger value="team">Event View</TabsTrigger>
      </TabsList>
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          <SelectItem value="time-off">Time Off</SelectItem>
          <SelectItem value="training">Training</SelectItem>
          <SelectItem value="meeting">Meetings</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
