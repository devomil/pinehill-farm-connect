
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ShiftReportFormFields } from "./ShiftReportFormFields";
import { useShiftReportForm } from "@/hooks/useShiftReportForm";

export function ShiftReportForm() {
  const { form, onSubmit, sendTestNotification, assignableEmployees } = useShiftReportForm();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <ShiftReportFormFields 
          form={form} 
          assignableEmployees={assignableEmployees}
        />

        <Button 
          type="button" 
          variant="secondary" 
          onClick={sendTestNotification}
          className="mt-4"
        >
          Send Test Notification
        </Button>

        <Button type="submit">Submit Report</Button>
      </form>
    </Form>
  );
}
