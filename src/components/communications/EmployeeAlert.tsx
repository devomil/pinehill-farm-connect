
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function EmployeeAlert() {
  return (
    <Alert className="bg-amber-50 border-amber-300">
      <AlertCircle className="h-4 w-4 text-amber-800" />
      <AlertDescription className="text-amber-800">
        You can only see yourself in the employee list. This is likely due to a database permission issue or because no other employees have been created yet. Try clicking "Fix Assignments" in the Reports page.
      </AlertDescription>
    </Alert>
  );
}
