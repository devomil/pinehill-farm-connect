
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
      <div className="space-y-6">
        <CalendarHeader />
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
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

          <div className="lg:w-1/3">
            <TodayCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
