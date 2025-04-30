
import { z } from "zod";

export const employeeFormSchema = z.object({
  // Basic info schema
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional(),
  position: z.string().optional(),
  
  // HR data schema
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  salary: z.number().positive("Salary must be positive").optional(),
  employmentType: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
  
  // Role selection doesn't need validation as it's boolean based
  roles: z.record(z.boolean()).optional()
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
