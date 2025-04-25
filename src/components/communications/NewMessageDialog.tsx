
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { User } from "@/types";

interface NewMessageDialogProps {
  employees: User[];
  onSend: any;
}

export function NewMessageDialog({ employees, onSend }: NewMessageDialogProps) {
  const form = useForm({
    defaultValues: {
      recipientId: "",
      message: "",
      type: "general" as const,
      shiftDate: "",
      shiftStart: "",
      shiftEnd: ""
    }
  });

  const type = form.watch("type");

  const onSubmit = (values: any) => {
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
          <FormField
            control={form.control}
            name="recipientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

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

          {type === "shift_coverage" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="shiftDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shiftStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shiftEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

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
