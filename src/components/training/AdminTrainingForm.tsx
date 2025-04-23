
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { TrainingAttachmentsField } from "./TrainingAttachmentsField";
import { TrainingQuizGenerator } from "./TrainingQuizGenerator";
import { BasicTrainingInfoSection } from "./BasicTrainingInfoSection";
import { RequiredDepartmentsSection } from "./RequiredDepartmentsSection";

interface AdminTrainingFormProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onTrainingCreated: () => void;
  currentUser: User;
}

const formSchema = z.object({
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

export const AdminTrainingForm: React.FC<AdminTrainingFormProps> = ({
  open,
  setOpen,
  onTrainingCreated,
  currentUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      duration: 30,
      expiresAfter: 365,
      requiredForAll: true,
      requiredForRetail: false,
      requiredForOperations: false,
      requiredForManagement: false,
      attachments: [],
      externalTestUrl: "",
    },
  });

  const handleRequiredForAllChange = (value: boolean) => {
    form.setValue("requiredForAll", value);
    if (value) {
      form.setValue("requiredForRetail", false);
      form.setValue("requiredForOperations", false);
      form.setValue("requiredForManagement", false);
    }
  };

  const handleSpecificDepartmentChange = () => {
    const retail = form.getValues("requiredForRetail");
    const operations = form.getValues("requiredForOperations");
    const management = form.getValues("requiredForManagement");
    
    if (retail || operations || management) {
      form.setValue("requiredForAll", false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
        return;
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

      if (error) throw error;

      toast.success("Training created successfully");
      form.reset();
      setOpen(false);
      onTrainingCreated();
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Training</DialogTitle>
          <DialogDescription>
            Create a new training course for employees
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <BasicTrainingInfoSection form={form} />
            
            <RequiredDepartmentsSection 
              form={form}
              onRequiredForAllChange={handleRequiredForAllChange}
              onSpecificDepartmentChange={handleSpecificDepartmentChange}
            />
            
            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <TrainingAttachmentsField 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
            
            <TrainingQuizGenerator 
              hasQuiz={hasQuiz}
              setHasQuiz={setHasQuiz}
              attachments={form.watch("attachments")}
              externalTestUrl={form.watch("externalTestUrl") || ""}
              setExternalTestUrl={(url) => form.setValue("externalTestUrl", url)}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Training"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
