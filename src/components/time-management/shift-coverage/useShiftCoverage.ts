import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";

// Define the schema for the shift coverage request form
const shiftCoverageRequestSchema = z.object({
  covering_employee_id: z.string().min(1, { message: "Covering employee is required" }),
  shift_date: z.string().min(1, { message: "Shift date is required" }),
  shift_start: z.string().min(1, { message: "Shift start is required" }),
  shift_end: z.string().min(1, { message: "Shift end is required" }),
});

// Define the type for the form data based on the schema
export type ShiftCoverageRequestForm = z.infer<typeof shiftCoverageRequestSchema>;

export const useShiftCoverage = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const { data: employees } = useEmployeeDirectory();
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setError] = useState<string | null>(null);

  // Initialize the form with react-hook-form
  const form = useForm<ShiftCoverageRequestForm>({
    resolver: zodResolver(shiftCoverageRequestSchema),
    defaultValues: {
      covering_employee_id: "",
      shift_date: "",
      shift_start: "",
      shift_end: "",
    },
  });

  // Function to handle form submission
  const handleSubmit = async (data: ShiftCoverageRequestForm) => {
    if (!data.covering_employee_id) {
      setError('covering_employee_id', {
        message: 'Please select an employee to cover the shift',
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create the shift coverage request with proper field names
      const response = await supabase.from('shift_coverage_requests').insert({
        original_employee_id: userId,
        covering_employee_id: data.covering_employee_id,
        shift_date: data.shift_date,
        shift_start: data.shift_start,
        shift_end: data.shift_end,
      });

      if (response.error) {
        console.error("Supabase error:", response.error);
        toast({
          title: "Failed to submit request",
          description: "There was an error submitting the shift coverage request. Please try again.",
          variant: "destructive",
        });
        setError("general", { message: "Failed to submit request" });
      } else {
        toast({
          title: "Request submitted",
          description: "Your shift coverage request has been submitted successfully.",
        });
        form.reset(); // Reset the form on success
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your request. Please check your connection and try again.",
        variant: "destructive",
      });
      setError("general", { message: "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: handleSubmit,
    isSubmitting,
    submitError,
    employees,
  };
};
