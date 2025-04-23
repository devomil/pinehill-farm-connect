
import * as z from "zod";

export const teamCalendarEventFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  attachments: z.any().optional(),
  attendanceType: z.enum(["required", "optional", "would-like", "info-only"]),
});

export type TeamCalendarEventFormData = z.infer<typeof teamCalendarEventFormSchema>;
