
import React from "react";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeBasicInfo } from "./EmployeeBasicInfo";
import { EmployeeHRData } from "./EmployeeHRData";
import { EmployeeRoles } from "./EmployeeRoles";
import { User } from "@/types";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormValues } from "./schemas/employeeFormSchema";

interface EditEmployeeFormProps {
  employee: User | null;
  form: UseFormReturn<EmployeeFormValues>;
  employeeData: User | null;
  employeeHR: any;
  selectedRoles: { [key: string]: boolean };
  isLoading: boolean;
  error?: string | null;
  handleBasicInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleHRDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRoleChange: (role: string, checked: boolean) => void;
  setEmployeeHR: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (data: EmployeeFormValues) => void;
  onClose: () => void;
}

export function EditEmployeeForm({
  employee,
  form,
  employeeData,
  employeeHR,
  selectedRoles,
  isLoading,
  error,
  handleBasicInfoChange,
  handleHRDataChange,
  handleRoleChange,
  setEmployeeHR,
  onSubmit,
  onClose
}: EditEmployeeFormProps) {
  // Make sure form submission is properly handled
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission initiated");
    form.handleSubmit((data) => {
      console.log("Form data validated:", data);
      onSubmit(data);
    })(e);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="hr">HR Data</TabsTrigger>
            <TabsTrigger value="roles">Roles & Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <EmployeeBasicInfo 
              employeeData={employeeData}
              handleBasicInfoChange={handleBasicInfoChange}
              form={form}
            />
          </TabsContent>
          
          <TabsContent value="hr">
            <EmployeeHRData 
              employeeHR={employeeHR}
              handleHRDataChange={handleHRDataChange}
              setEmployeeHR={setEmployeeHR}
              form={form}
            />
          </TabsContent>
          
          <TabsContent value="roles">
            <EmployeeRoles 
              selectedRoles={selectedRoles}
              handleRoleChange={handleRoleChange}
              employee={employee}
            />
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}
        
        <DialogFooter className="mt-4 pt-2 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[120px] bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
