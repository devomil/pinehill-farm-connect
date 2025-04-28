
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ShiftReportFormFields } from "./ShiftReportFormFields";
import { useShiftReportForm } from "@/hooks/useShiftReportForm";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ShiftReportForm() {
  const { form, onSubmit, sendTestNotification, assignableEmployees, createTestAssignment } = useShiftReportForm();
  
  console.log("ShiftReportForm rendering with assignable employees:", assignableEmployees);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <ShiftReportFormFields 
          form={form} 
          assignableEmployees={assignableEmployees}
        />

        {assignableEmployees.length === 0 && (
          <Alert variant="default" className="mb-4 border-orange-500 bg-orange-50 text-orange-900">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <AlertDescription>
              No admin/manager users found. Click "Fix Assignments" to create an admin role and set up assignments automatically.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={sendTestNotification}
            className="w-full sm:w-auto"
          >
            Send Test Notification
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            onClick={createTestAssignment}
            className="w-full sm:w-auto"
          >
            Fix Assignments
          </Button>

          <Button 
            type="submit"
            className="w-full sm:w-auto"
          >
            Submit Report
          </Button>
        </div>
      </form>
    </Form>
  );
}
