
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { User } from "@/types";
import { EmployeeSelector } from "./EmployeeSelector";

interface WorkScheduleHeaderProps {
  currentMonthLabel: string;
  isAdmin: boolean;
  selectedEmployee: string | null;
  employees: User[];
  onSelectEmployee: (employeeId: string) => void;
  onCopyFromLastMonth: () => void;
  loading: boolean;
}

export const WorkScheduleHeader: React.FC<WorkScheduleHeaderProps> = ({
  currentMonthLabel,
  isAdmin,
  selectedEmployee,
  employees,
  onSelectEmployee,
  onCopyFromLastMonth,
  loading
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">Work Schedule {currentMonthLabel}</h2>
      {isAdmin && (
        <div className="flex gap-2">
          <EmployeeSelector 
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={onSelectEmployee}
          />
          <Button 
            variant="outline" 
            onClick={onCopyFromLastMonth}
            disabled={loading || !selectedEmployee}
          >
            Copy From Last Month
          </Button>
        </div>
      )}
    </div>
  );
};
