
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import { EmployeeBasicInfo } from "./EmployeeBasicInfo";
import { EmployeeHRData } from "./EmployeeHRData";
import { EmployeeRoles } from "./EmployeeRoles";
import { useEmployeeDetail } from "./hooks/useEmployeeDetail";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeFormSchema, EmployeeFormValues } from "./schemas/employeeFormSchema";
import { toast } from "sonner";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onEmployeeUpdate: () => void;
}

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdate,
}: EmployeeDetailModalProps) {
  const {
    employeeData,
    employeeHR,
    isLoading,
    selectedRoles,
    handleBasicInfoChange,
    handleHRDataChange,
    handleRoleChange,
    saveEmployeeData,
    setEmployeeHR
  } = useEmployeeDetail(employee, onEmployeeUpdate, onClose);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employeeData?.name || '',
      department: employeeData?.department || '',
      position: employeeData?.position || '',
      startDate: employeeHR?.startDate,
      endDate: employeeHR?.endDate,
      salary: employeeHR?.salary,
      employmentType: (employeeHR?.employmentType as "" | "full-time" | "part-time" | "contract" | "seasonal" | "intern") || '',
      address: employeeHR?.address || '',
      phone: employeeHR?.phone || '',
      emergencyContact: employeeHR?.emergencyContact || '',
      notes: employeeHR?.notes || '',
    }
  });

  // Update form values when employee data changes
  React.useEffect(() => {
    if (employeeData) {
      form.setValue('name', employeeData.name || '');
      form.setValue('department', employeeData.department || '');
      form.setValue('position', employeeData.position || '');
    }
    if (employeeHR) {
      form.setValue('startDate', employeeHR.startDate);
      form.setValue('endDate', employeeHR.endDate);
      form.setValue('salary', employeeHR.salary);
      form.setValue('employmentType', (employeeHR.employmentType as "" | "full-time" | "part-time" | "contract" | "seasonal" | "intern") || '');
      form.setValue('address', employeeHR.address || '');
      form.setValue('phone', employeeHR.phone || '');
      form.setValue('emergencyContact', employeeHR.emergencyContact || '');
      form.setValue('notes', employeeHR.notes || '');
    }
  }, [employeeData, employeeHR, form]);

  if (!employeeData) return null;

  const onSubmit = (data: EmployeeFormValues) => {
    try {
      saveEmployeeData();
    } catch (error) {
      toast.error("Failed to save employee data");
      console.error("Form submission error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details: {employeeData.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                />
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
