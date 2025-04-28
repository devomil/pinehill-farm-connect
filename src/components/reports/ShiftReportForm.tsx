
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ShiftReportFormFields } from "./ShiftReportFormFields";
import { useShiftReportForm } from "@/hooks/useShiftReportForm";

export function ShiftReportForm() {
  const { form, onSubmit, sendTestNotification, assignableEmployees } = useShiftReportForm();
  
  console.log("ShiftReportForm rendering with assignable employees:", assignableEmployees);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <ShiftReportFormFields 
          form={form} 
          assignableEmployees={assignableEmployees}
        />

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
