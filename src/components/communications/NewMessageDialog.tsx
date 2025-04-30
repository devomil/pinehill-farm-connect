
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RecipientSelect } from "./RecipientSelect";
import { ShiftDetailsForm } from "./ShiftDetailsForm";
import { NewMessageDialogProps, NewMessageFormData, MessageType } from "@/types/communications";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function NewMessageDialog({ employees, onSend, onClose }: NewMessageDialogProps) {
  const { currentUser } = useAuth();
  const form = useForm<NewMessageFormData>({
    defaultValues: {
      recipientId: "",
      message: "",
      type: "general",
      shiftDate: "",
      shiftStart: "",
      shiftEnd: ""
    }
  });

  const type = form.watch("type") as MessageType;
  
  // Filter out the current user to avoid sending messages to self
  const filteredEmployees = React.useMemo(() => {
    if (!currentUser) return employees;
    return employees.filter(emp => emp.id !== currentUser.id);
  }, [employees, currentUser]);

  // Reset form when dialog is opened
  useEffect(() => {
    form.reset({
      recipientId: "",
      message: "",
      type: "general",
      shiftDate: "",
      shiftStart: "",
      shiftEnd: ""
    });
  }, [form]);

  const onSubmit = (values: NewMessageFormData) => {
    // Enhanced validation to ensure recipient exists
    if (!values.recipientId) {
      form.setError("recipientId", { 
        type: "manual", 
        message: "Please select a recipient" 
      });
      return;
    }
    
    const recipientExists = filteredEmployees.some(emp => emp.id === values.recipientId);
    
    if (!recipientExists) {
      form.setError("recipientId", { 
        type: "manual", 
        message: "Selected recipient is no longer available" 
      });
      toast.error("Selected recipient is no longer available. Please refresh and try again.");
      return;
    }
    
    // Validate required message
    if (!values.message.trim()) {
      form.setError("message", {
        type: "manual",
        message: "Message is required"
      });
      return;
    }
    
    // For shift coverage, validate shift details
    if (type === "shift_coverage") {
      if (!values.shiftDate) {
        form.setError("shiftDate", {
          type: "manual",
          message: "Shift date is required"
        });
        return;
      }
      
      if (!values.shiftStart) {
        form.setError("shiftStart", {
          type: "manual",
          message: "Shift start time is required"
        });
        return;
      }
      
      if (!values.shiftEnd) {
        form.setError("shiftEnd", {
          type: "manual",
          message: "Shift end time is required"
        });
        return;
      }
    }
    
    const shiftDetails = type === "shift_coverage" ? {
      shift_date: values.shiftDate,
      shift_start: values.shiftStart,
      shift_end: values.shiftEnd
    } : undefined;

    onSend({
      recipientId: values.recipientId,
      message: values.message,
      type: values.type,
      shiftDetails
    });
    
    // Close dialog on successful submission
    if (onClose) onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Message</DialogTitle>
        <DialogDescription>
          Send a direct message to another employee
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <RecipientSelect form={form} employees={filteredEmployees} />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General Message</SelectItem>
                    <SelectItem value="shift_coverage">Shift Coverage Request</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {type === "shift_coverage" && <ShiftDetailsForm form={form} />}

          <FormField
            control={form.control}
            name="message"
            rules={{ required: "Message is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      type === "shift_coverage"
                        ? "Add any additional details about the shift coverage request..."
                        : "Type your message here..."
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">Send</Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
