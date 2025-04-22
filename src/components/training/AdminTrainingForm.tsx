
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

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
});

export const AdminTrainingForm: React.FC<AdminTrainingFormProps> = ({
  open,
  setOpen,
  onTrainingCreated,
  currentUser,
}) => {
  const [loading, setLoading] = useState(false);

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
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Calculate requiredFor array
      let requiredFor: string[] = [];
      
      if (values.requiredForAll) {
        requiredFor = ["all"];
      } else {
        if (values.requiredForRetail) requiredFor.push("retail");
        if (values.requiredForOperations) requiredFor.push("operations");
        if (values.requiredForManagement) requiredFor.push("management");
      }
      
      // Exit if no one is required
      if (requiredFor.length === 0) {
        toast.error("You must select at least one department");
        setLoading(false);
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
      };

      const { error } = await supabase
        .from("trainings")
        .insert([newTraining]);

      if (error) {
        console.error("Error creating training:", error);
        toast.error("Failed to create training");
        return;
      }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Training</DialogTitle>
          <DialogDescription>
            Create a new training course for employees
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training Title</FormLabel>
                  <FormControl>
                    <Input placeholder="CBD 101" {...field} />
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
                    <Textarea placeholder="Description of the training content..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="CBD101, HIPAA, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiresAfter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires After (days, leave empty if never)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="365" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Required For</FormLabel>
              
              <FormField
                control={form.control}
                name="requiredForAll"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={(value) => handleRequiredForAllChange(value as boolean)} 
                      />
                    </FormControl>
                    <FormLabel className="font-normal">All Employees</FormLabel>
                  </FormItem>
                )}
              />

              {!form.watch("requiredForAll") && (
                <div className="pl-6 space-y-2">
                  <FormField
                    control={form.control}
                    name="requiredForRetail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              handleSpecificDepartmentChange();
                            }} 
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Retail</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requiredForOperations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              handleSpecificDepartmentChange();
                            }} 
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Operations</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requiredForManagement"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              handleSpecificDepartmentChange();
                            }} 
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Management</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

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
