
import React, { useState } from "react";
import { PlusCircle, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import { notifyManager } from "@/utils/notifyManager";

export interface TeamCalendarEventFormProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onEventCreated: () => void;
  currentUser: any;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  attachments: z.array(z.string()).optional(),
  attendanceType: z.enum(["required", "optional", "would-like", "info-only"]),
  sendNotifications: z.boolean().default(false),
});

export const TeamCalendarEventForm: React.FC<TeamCalendarEventFormProps> = ({
  open,
  setOpen,
  onEventCreated,
  currentUser,
}) => {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      attachments: [],
      attendanceType: "required",
      sendNotifications: false,
    },
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return [];
    setUploading(true);

    const attachments: string[] = [];
    for (let i = 0; i < Math.min(files.length, 2); i++) {
      const file = files[i];
      if (!file.type.match(/image|pdf/)) {
        toast.error("File type must be image or PDF");
        continue;
      }
      if (file.size > 1 * 1024 * 1024) {
        toast.error("File too large (max 1MB)");
        continue;
      }
      const reader = new FileReader();
      attachments.push(
        await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        })
      );
    }
    setUploading(false);
    return attachments;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const newEvent = {
        title: values.title,
        description: values.description || "",
        start_date: values.startDate.toISOString().split("T")[0],
        end_date: values.endDate.toISOString().split("T")[0],
        created_by: currentUser.id,
        attendance_type: values.attendanceType,
        attachments: values.attachments ?? [],
      };
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from("company_events")
        .insert([newEvent]);
      if (error) {
        toast.error("Failed to create event");
        setLoading(false);
        return;
      }
      toast.success("Event created successfully");
      if (values.sendNotifications) {
        await notifyManager("event_created", currentUser, {
          event: newEvent,
          notificationType: "team_calendar"
        });
        toast.success("Notifications sent to team members");
      }
      setOpen(false);
      form.reset();
      onEventCreated();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new calendar event for your team
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Team Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Event details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value.toISOString().split('T')[0]}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value.toISOString().split('T')[0]}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="attendanceType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Attendance Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="required" id="required" />
                        <Label htmlFor="required" className="flex items-center gap-1">
                          Required
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="would-like" id="would-like" />
                        <Label htmlFor="would-like" className="flex items-center gap-1">
                          Would like to attend
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="optional" id="optional" />
                        <Label htmlFor="optional" className="flex items-center gap-1">
                          Optional
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="info-only" id="info-only" />
                        <Label htmlFor="info-only" className="flex items-center gap-1">
                          Information only
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments (Images or PDFs, max 2, 1MB each)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      disabled={uploading}
                      onChange={async (e) => {
                        const uploaded = await handleFileUpload(e.target.files);
                        field.onChange((field.value || []).concat(uploaded));
                      }}
                    />
                  </FormControl>
                  {(field.value && field.value.length > 0) && (
                    <div className="mt-2 space-y-2">
                      {field.value.map((a: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {a.startsWith("data:image") ? (
                            <img src={a} alt={`Attachment-${idx}`} className="h-8 w-8 rounded" />
                          ) : a.startsWith("data:application/pdf") ? (
                            <span className="text-blue-400">PDF document {idx+1}</span>
                          ) : (
                            <span>Attachment {idx+1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="send-notifications"
                checked={form.watch("sendNotifications")}
                onChange={(e) => form.setValue("sendNotifications", e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="send-notifications" className="flex items-center gap-1">
                <Bell className="h-4 w-4 text-amber-500" />
                Send notifications to team members
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading || uploading}>
                {loading || uploading ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
