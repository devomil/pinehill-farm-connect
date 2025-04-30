
import { z } from "zod";

export const employeeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  salary: z.number().optional().nullable(),
  employmentType: z.enum(["", "full-time", "part-time", "contract", "seasonal", "intern"]).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional()
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
