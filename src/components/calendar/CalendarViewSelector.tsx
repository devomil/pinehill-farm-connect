
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
        <TabsTrigger value="month">Schedule View</TabsTrigger>
        <TabsTrigger value="team">Company Events</TabsTrigger>
      </TabsList>
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Items</SelectItem>
          <SelectItem value="shifts">Work Shifts</SelectItem>
          <SelectItem value="time-off">Time Off</SelectItem>
          <SelectItem value="coverage">Shift Coverage</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
