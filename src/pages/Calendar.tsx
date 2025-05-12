
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { addMonths, subMonths } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarContent } from "@/components/calendar/CalendarContent";
import { TodayCard } from "@/components/calendar/TodayCard";

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "team">("month");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { currentUser } = useAuth();

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <CalendarHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <CalendarContent
              date={date}
              currentMonth={currentMonth}
              viewMode={viewMode}
              currentUser={currentUser}
              onDateSelect={(newDate) => newDate && setDate(newDate)}
              onViewModeChange={setViewMode}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
            />
          </div>

          <div className="md:col-span-1">
            <TodayCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
