
import React, { useState, useEffect } from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { User } from "@/types";
import { AdminWorkScheduleEditor } from "./AdminWorkScheduleEditor";
import { EmployeeScheduleView } from "./EmployeeScheduleView";
import { useWorkSchedule } from "./hooks/useWorkSchedule";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { WorkScheduleHeader } from "./WorkScheduleHeader";
import { WorkScheduleError } from "./WorkScheduleError";

interface WorkScheduleTabProps {
  isAdmin: boolean;
  currentUser: User;
}

export const WorkScheduleTab: React.FC<WorkScheduleTabProps> = ({ isAdmin, currentUser }) => {
  const { employees } = useEmployeeDirectory();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
    isAdmin ? null : currentUser.id
  );
  const {
    scheduleData,
    loading,
    error,
    saveSchedule,
    resetSchedule,
    copyFromLastMonth
  } = useWorkSchedule(selectedEmployee);
  
  const currentMonthLabel = format(new Date(), "MMMM yyyy");

  // If user is not admin, they can only see their own schedule
  useEffect(() => {
    if (!isAdmin) {
      setSelectedEmployee(currentUser.id);
    }
  }, [isAdmin, currentUser.id]);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <WorkScheduleHeader 
          currentMonthLabel={currentMonthLabel}
          isAdmin={isAdmin}
          selectedEmployee={selectedEmployee}
          employees={employees}
          onSelectEmployee={setSelectedEmployee}
          onCopyFromLastMonth={copyFromLastMonth}
          loading={loading}
        />
      </CardHeader>
      <CardContent>
        {error ? (
          <WorkScheduleError error={error} />
        ) : isAdmin ? (
          <AdminWorkScheduleEditor
            selectedEmployee={selectedEmployee}
            scheduleData={scheduleData}
            onSave={saveSchedule}
            onReset={resetSchedule}
            loading={loading}
          />
        ) : (
          <EmployeeScheduleView 
            scheduleData={scheduleData}
            loading={loading}
          />
        )}
      </CardContent>
    </Card>
  );
};
