
import { useState } from "react";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { submitShiftReport } from "./services/shiftReportService";
import { ShiftReport, ShiftReportInput } from "./types/shiftReportTypes";

export function useShiftSubmission(currentUser: User | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ShiftReport | null>(null);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  const handleSubmit = async (reportData: ShiftReportInput): Promise<ShiftReport | null> => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const result = await submitShiftReport(reportData, currentUser);
      setSubmissionResult(result as unknown as ShiftReport);
      return result as unknown as ShiftReport;
    } catch (error) {
      console.error("Error in useShiftSubmission:", error);
      setSubmitError(error as Error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    submissionResult,
    submitError
  };
}
