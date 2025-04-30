
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import { useEmployeeEdit } from "@/hooks/useEmployeeEdit";
import { Loader2 } from "lucide-react";
import { EmployeeBasicInfo } from "./EmployeeBasicInfo";
import { EmployeeHRData } from "./EmployeeHRData";
import { EmployeeRoles } from "./EmployeeRoles";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeFormSchema, EmployeeFormValues } from "./schemas/employeeFormSchema";
import { Form } from "@/components/ui/form";
import { useEmployeeDetail } from "./hooks/useEmployeeDetail";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onEmployeeUpdate: () => void;
}

export function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdate,
}: EditEmployeeModalProps) {
  const { updateEmployeeDetails, isLoading: isUpdatingBasicInfo, error } = useEmployeeEdit();
  
  // Use employeeDetail hook to get access to role management
  const {
    employeeData,
    employeeHR,
    isLoading: isDetailLoading,
    selectedRoles,
    handleBasicInfoChange,
    handleHRDataChange,
    handleRoleChange,
    saveEmployeeData,
    setEmployeeHR
  } = useEmployeeDetail(employee, onEmployeeUpdate, onClose);

  const isLoading = isUpdatingBasicInfo || isDetailLoading;
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      department: "",
      position: "",
      employeeId: "",
      startDate: undefined,
      endDate: undefined,
      salary: undefined,
      employmentType: undefined,
      address: "",
      phone: "",
      emergencyContact: "",
      notes: "",
    }
  });

  // Reset form when employee changes or modal opens/closes
  useEffect(() => {
    if (isOpen && employee) {
      form.reset({
        name: employee.name || '',
        department: employee.department || '',
        position: employee.position || '',
        employeeId: employee.employeeId || '',
        startDate: employeeHR?.startDate,
        endDate: employeeHR?.endDate,
        salary: employeeHR?.salary,
        employmentType: employeeHR?.employmentType,
        address: employeeHR?.address || '',
        phone: employeeHR?.phone || '',
        emergencyContact: employeeHR?.emergencyContact || '',
        notes: employeeHR?.notes || '',
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      form.reset();
    }
  }, [employee, employeeHR, form, isOpen]);

  const handleSubmit = async (data: EmployeeFormValues) => {
    if (!employee) return;
    
    // Update local state
    if (employeeData) {
      employeeData.name = data.name;
      employeeData.department = data.department;
      employeeData.position = data.position;
      employeeData.employeeId = data.employeeId;
    }
    
    if (employeeHR) {
      employeeHR.startDate = data.startDate;
      employeeHR.endDate = data.endDate;
      employeeHR.salary = data.salary;
      employeeHR.employmentType = data.employmentType;
      employeeHR.address = data.address;
      employeeHR.phone = data.phone;
      employeeHR.emergencyContact = data.emergencyContact;
      employeeHR.notes = data.notes;
      
      setEmployeeHR({...employeeHR});
    }
    
    // Save all data at once
    const success = await saveEmployeeData();
    
    if (success) {
      onEmployeeUpdate();
      handleClose();
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee: {employee.name}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
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
      </DialogContent>
    </Dialog>
  );
}
