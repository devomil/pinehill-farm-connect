
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DashboardAlertProps {
  trainingCount: number;
}

export const DashboardAlert: React.FC<DashboardAlertProps> = ({ trainingCount }) => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-800" />
      <AlertTitle>Training Reminder</AlertTitle>
      <AlertDescription>
        You have {trainingCount} pending training{trainingCount > 1 ? 's' : ''} to complete.
      </AlertDescription>
    </Alert>
  );
};
