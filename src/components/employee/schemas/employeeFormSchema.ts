
import { z } from "zod";

export const employeeFormSchema = z.object({
  // Basic info schema with improved validation
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  department: z.string().optional()
    .refine(val => !val || val.length >= 2, {
      message: "Department name must be at least 2 characters if provided"
    }),
  position: z.string().optional()
    .refine(val => !val || val.length >= 2, {
      message: "Position must be at least 2 characters if provided"
    }),
  
  // HR data schema with improved validation
  startDate: z.date().optional()
    .refine(val => !val || val <= new Date(), {
      message: "Start date cannot be in the future"
    }),
  endDate: z.date().optional()
    .refine(val => !val || val >= new Date(), {
      message: "End date cannot be in the past"
    }),
  salary: z.number()
    .positive("Salary must be positive")
    .finite("Please enter a valid number")
    .optional(),
  employmentType: z.enum(["full-time", "part-time", "contract", "seasonal", "intern", ""])
    .optional(),
  address: z.string()
    .optional()
    .refine(val => !val || val.length >= 5, {
      message: "Address must be at least 5 characters if provided"
    }),
  phone: z.string()
    .optional()
    .refine(val => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
      message: "Please enter a valid phone number"
    }),
  emergencyContact: z.string()
    .optional()
    .refine(val => !val || val.length >= 5, {
      message: "Emergency contact must be at least 5 characters if provided"
    }),
  notes: z.string().optional(),
  
  // Role selection validation
  roles: z.record(z.boolean()).optional()
}).refine((data) => {
  // If end date is provided, it should be after start date
  if (data.endDate && data.startDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
