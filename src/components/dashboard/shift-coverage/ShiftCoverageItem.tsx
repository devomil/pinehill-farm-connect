
import React from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";

interface ShiftCoverageItemProps {
  message: Communication;
  currentUser: User;
}

export const ShiftCoverageItem: React.FC<ShiftCoverageItemProps> = ({
  message,
  currentUser
}) => {
  const { employees } = useEmployeeDirectory();
  const shiftRequest = message.shift_coverage_requests![0];
  const isRequester = shiftRequest.original_employee_id === currentUser.id;
  const requesterId = shiftRequest.original_employee_id;
  const covererId = shiftRequest.covering_employee_id;
  
  // Helper function to find employee name by ID
  const getEmployeeName = (id: string): string => {
    const employee = employees?.find(emp => emp.id === id);
    return employee?.name || 'Unknown Employee';
  };
  
  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
  };
  
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <div>
        <p className="text-sm font-medium">
          {isRequester ? 
            `You requested ${getEmployeeName(covererId)} to cover` : 
            `${getEmployeeName(requesterId)} requested coverage`}
        </p>
        <p className="text-xs text-muted-foreground">
          {shiftRequest.shift_date} ({shiftRequest.shift_start} - {shiftRequest.shift_end})
        </p>
        <p className="text-xs text-muted-foreground">
          Sent on {format(new Date(message.created_at), "MMM d")}
        </p>
      </div>
      <div>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      </div>
    </div>
  );
};
