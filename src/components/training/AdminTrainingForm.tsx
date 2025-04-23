
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/types";
import { TrainingAttachmentsField } from "./TrainingAttachmentsField";
import { TrainingQuizGenerator } from "./TrainingQuizGenerator";
import { BasicTrainingInfoSection } from "./BasicTrainingInfoSection";
import { RequiredDepartmentsSection } from "./RequiredDepartmentsSection";
import { useTrainingForm, TrainingFormValues } from "@/hooks/useTrainingForm";

interface AdminTrainingFormProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onTrainingCreated: () => void;
  currentUser: User;
}

export const AdminTrainingForm: React.FC<AdminTrainingFormProps> = ({
  open,
  setOpen,
  onTrainingCreated,
  currentUser,
}) => {
  const [hasQuiz, setHasQuiz] = useState(false);
  
  const {
    loading,
    handleSubmit,
    handleRequiredForAllChange,
    handleSpecificDepartmentChange,
    formSchema,
  } = useTrainingForm({
    currentUser,
    onTrainingCreated,
    setOpen,
  });

  const form = useForm<TrainingFormValues>({
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

  const onSubmit = (values: TrainingFormValues) => {
    handleSubmit(values, hasQuiz);
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
              onRequiredForAllChange={(value) => handleRequiredForAllChange(form, value)}
              onSpecificDepartmentChange={() => handleSpecificDepartmentChange(form)}
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
