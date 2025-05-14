
import React, { useState, useEffect } from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { User } from "@/types";
import { AdminWorkScheduleEditor } from "./AdminWorkScheduleEditor";
import { EmployeeScheduleView } from "./EmployeeScheduleView";
import { useWorkSchedule } from "./useWorkSchedule";
import { WorkSchedule } from "@/types/workSchedule";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-destructive">Error loading schedule data: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Work Schedule {currentMonthLabel}</CardTitle>
          {isAdmin && (
            <div className="flex gap-2">
              <Select
                value={selectedEmployee || ""}
                onValueChange={(value) => setSelectedEmployee(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={copyFromLastMonth}
                disabled={loading || !selectedEmployee}
              >
                Copy From Last Month
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdmin ? (
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
