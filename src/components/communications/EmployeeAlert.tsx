
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function EmployeeAlert() {
  return (
    <Alert className="bg-amber-50 border-amber-300">
      <AlertCircle className="h-4 w-4 text-amber-800" />
      <AlertDescription className="text-amber-800 flex flex-col md:flex-row md:items-center gap-2">
        <span>You can only see yourself in the employee list. This might be due to a database permission issue. Click the button below to fix this issue.</span>
        <Button variant="outline" className="bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200 self-start" asChild>
          <Link to="/reports">
            Fix Assignments
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
