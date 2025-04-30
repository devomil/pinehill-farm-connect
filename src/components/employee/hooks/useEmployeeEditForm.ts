
import { useState } from "react";
import { User } from "@/types";
import { useEmployeeDetail } from "./useEmployeeDetail";
import { EmployeeFormValues } from "../schemas/employeeFormSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeFormSchema } from "../schemas/employeeFormSchema";
import { toast } from "sonner";

export function useEmployeeEditForm(
  employee: User | null,
  onEmployeeUpdate: () => void,
  onClose: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const isLoading = isSubmitting || isDetailLoading;
  
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

  // Reset form with employee data
  const resetFormWithEmployeeData = () => {
    if (employee) {
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
    } else {
      form.reset();
    }
  };

  const handleSubmit = async (data: EmployeeFormValues) => {
    if (!employee) return;
    
    try {
      setIsSubmitting(true);
      console.log("Submitting form data:", data);
      
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
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Failed to save employee data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return {
    form,
    employeeData,
    employeeHR,
    selectedRoles,
    isLoading,
    handleBasicInfoChange,
    handleHRDataChange,
    handleRoleChange,
    handleSubmit,
    handleClose,
    resetFormWithEmployeeData
  };
}
