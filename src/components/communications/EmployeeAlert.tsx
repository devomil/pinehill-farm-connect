
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmployeeAlertProps {
  employeeCount?: number;
  isLoading?: boolean;
}

export function EmployeeAlert({ employeeCount = 0, isLoading = false }: EmployeeAlertProps) {
  if (isLoading) {
    return (
      <Alert className="bg-blue-50 border-blue-300">
        <AlertCircle className="h-4 w-4 text-blue-800" />
        <AlertTitle className="text-blue-800">Loading employee data...</AlertTitle>
        <AlertDescription className="text-blue-700">
          Please wait while we fetch the employee directory.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-amber-50 border-amber-300">
      <AlertCircle className="h-4 w-4 text-amber-800" />
      <AlertDescription className="text-amber-800 flex flex-col md:flex-row md:items-center gap-2">
        {employeeCount === 0 ? (
          <span>There are currently no other employees registered in the system. Once more employees are added, you'll be able to view them here.</span>
        ) : (
          <span>You need to be assigned to a team to see other employees. Click below to go to the Reports page where admins can add you to teams.</span>
        )}
        <Button variant="outline" className="bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200 self-start" asChild>
          <Link to="/reports">
            Team Assignments
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
