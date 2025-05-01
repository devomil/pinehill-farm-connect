
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { User } from "@/types";
import { NewMessageFormData } from "@/types/communications";

interface NewShiftCoverageRequestFormProps {
  employees: User[];
  onSubmit: (data: NewMessageFormData) => void;
  isLoading: boolean;
  currentUser: User;
}

const formSchema = z.object({
  recipientId: z.string({
    required_error: "Please select an employee to cover your shift",
  }),
  message: z.string().min(5, "Message must be at least 5 characters"),
  shiftDate: z.string({
    required_error: "Please select a date for your shift",
  }),
  shiftStart: z.string({
    required_error: "Please enter a start time for your shift",
  }),
  shiftEnd: z.string({
    required_error: "Please enter an end time for your shift",
  }),
});

export const NewShiftCoverageRequestForm: React.FC<NewShiftCoverageRequestFormProps> = ({
  employees,
  onSubmit,
  isLoading,
  currentUser,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: `Hi, would you be able to cover my shift?`,
      shiftDate: "",
      shiftStart: "",
      shiftEnd: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Ensure all required fields are included and non-optional
    const formData: NewMessageFormData = {
      recipientId: values.recipientId, // This is now guaranteed to exist
      message: values.message,
      type: "shift_coverage",
      shiftDate: values.shiftDate,
      shiftStart: values.shiftStart, 
      shiftEnd: values.shiftEnd
    };
    
    onSubmit(formData);
  };

  // Filter out current user from employee list
  const filteredEmployees = employees.filter(emp => emp.id !== currentUser.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="recipientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee to Cover Shift</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name || employee.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shiftDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
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
                <FormMessage />
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            "Send Request"
          )}
        </Button>
      </form>
    </Form>
  );
};
