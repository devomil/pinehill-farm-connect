
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarViewSelector } from "./CalendarViewSelector";
import { User } from "@/types";

interface CalendarContentProps {
  date: Date;
  currentMonth: Date;
  viewMode: "month" | "team";
  currentUser: User;
  onDateSelect: (date: Date | undefined) => void;
  onViewModeChange: (value: "month" | "team") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  clickable?: boolean;
}

export function CalendarContent({
  date,
  currentMonth,
  viewMode,
  currentUser,
  onDateSelect,
  onViewModeChange,
  onPreviousMonth,
  onNextMonth,
  clickable = false,
}: CalendarContentProps) {
  return (
    <Card className={clickable ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            View team schedules and time-off
          </CardDescription>
        </div>
        <CalendarNavigation
          currentMonth={currentMonth}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
        />
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as "month" | "team")}>
          <CalendarViewSelector
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
          
          <TabsContent value="month" className="mt-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateSelect}
              month={currentMonth}
              className="rounded-md border"
            />
          </TabsContent>
          
          <TabsContent value="team" className="mt-0">
            <TeamCalendar currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
