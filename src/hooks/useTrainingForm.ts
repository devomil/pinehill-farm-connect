
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import * as z from "zod";

export const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 minute" }),
  expiresAfter: z.coerce.number().optional(),
  requiredForAll: z.boolean().default(true),
  requiredForRetail: z.boolean().default(false),
  requiredForOperations: z.boolean().default(false),
  requiredForManagement: z.boolean().default(false),
  attachments: z.array(z.string()).default([]),
  externalTestUrl: z.string().url().optional().or(z.literal('')),
});

export type TrainingFormValues = z.infer<typeof formSchema>;

interface UseTrainingFormProps {
  currentUser: User;
  onTrainingCreated: () => void;
  setOpen: (value: boolean) => void;
}

export const useTrainingForm = ({ currentUser, onTrainingCreated, setOpen }: UseTrainingFormProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: TrainingFormValues, hasQuiz: boolean) => {
    try {
      setLoading(true);
      
      let requiredFor: string[] = [];
      
      if (values.requiredForAll) {
        requiredFor = ["all"];
      } else {
        if (values.requiredForRetail) requiredFor.push("retail");
        if (values.requiredForOperations) requiredFor.push("operations");
        if (values.requiredForManagement) requiredFor.push("management");
      }
      
      if (requiredFor.length === 0) {
        toast.error("You must select at least one department");
        return false;
      }

      // Make sure we have a valid UUID for created_by
      if (!currentUser?.id || typeof currentUser.id !== 'string' || !currentUser.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error("Invalid user ID:", currentUser?.id);
        toast.error("Authentication error. Please log in again.");
        return false;
      }

      const newTraining = {
        title: values.title,
        description: values.description || "",
        category: values.category,
        duration: values.duration,
        expires_after: values.expiresAfter || null,
        required_for: requiredFor,
        created_by: currentUser.id,
        attachments: values.attachments,
        has_quiz: hasQuiz,
        external_test_url: values.externalTestUrl || null,
      };

      const { error } = await supabase
        .from("trainings")
        .insert([newTraining]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast.success("Training created successfully");
      setOpen(false);
      onTrainingCreated();
      return true;
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("An error occurred while creating the training");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRequiredForAllChange = (form: any, value: boolean) => {
    form.setValue("requiredForAll", value);
    if (value) {
      form.setValue("requiredForRetail", false);
      form.setValue("requiredForOperations", false);
      form.setValue("requiredForManagement", false);
    }
  };

  const handleSpecificDepartmentChange = (form: any) => {
    const retail = form.getValues("requiredForRetail");
    const operations = form.getValues("requiredForOperations");
    const management = form.getValues("requiredForManagement");
    
    if (retail || operations || management) {
      form.setValue("requiredForAll", false);
    }
  };

  return {
    loading,
    handleSubmit,
    handleRequiredForAllChange,
    handleSpecificDepartmentChange,
    formSchema,
  };
};
