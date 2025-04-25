
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RecipientSelect } from "./RecipientSelect";
import { ShiftDetailsForm } from "./ShiftDetailsForm";
import { NewMessageDialogProps, NewMessageFormData, MessageType } from "@/types/communications";

export function NewMessageDialog({ employees, onSend }: NewMessageDialogProps) {
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

  const onSubmit = (values: NewMessageFormData) => {
    const shiftDetails = type === "shift_coverage" ? {
      shift_date: values.shiftDate,
      shift_start: values.shiftStart,
      shift_end: values.shiftEnd
    } : undefined;

    onSend.mutate({
      recipientId: values.recipientId,
      message: values.message,
      type: values.type,
      shiftDetails
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Message</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <RecipientSelect form={form} employees={employees} />

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
              </FormItem>
            )}
          />

          {type === "shift_coverage" && <ShiftDetailsForm form={form} />}

          <FormField
            control={form.control}
            name="message"
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
