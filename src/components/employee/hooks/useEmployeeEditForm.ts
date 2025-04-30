
import { useState, useEffect } from "react";
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
      
      // Create a deep copy of the employeeData and employeeHR objects before modifying
      // to prevent any state mutation issues
      const updatedEmployeeData = employeeData ? { ...employeeData } : null;
      const updatedEmployeeHR = employeeHR ? { ...employeeHR } : null;
      
      // Update the copied objects
      if (updatedEmployeeData) {
        updatedEmployeeData.name = data.name;
        updatedEmployeeData.department = data.department;
        updatedEmployeeData.position = data.position;
        updatedEmployeeData.employeeId = data.employeeId;
      }
      
      if (updatedEmployeeHR) {
        updatedEmployeeHR.startDate = data.startDate;
        updatedEmployeeHR.endDate = data.endDate;
        updatedEmployeeHR.salary = data.salary;
        updatedEmployeeHR.employmentType = data.employmentType;
        updatedEmployeeHR.address = data.address;
        updatedEmployeeHR.phone = data.phone;
        updatedEmployeeHR.emergencyContact = data.emergencyContact;
        updatedEmployeeHR.notes = data.notes;
        
        // Use the setter function to update the HR state
        setEmployeeHR(updatedEmployeeHR);
      }
      
      // Save all data at once
      const success = await saveEmployeeData();
      
      if (success) {
        // Call onEmployeeUpdate and close the modal after a short delay
        // to allow state updates to complete
        setTimeout(() => {
          onEmployeeUpdate();
          handleClose();
        }, 100);
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
    resetFormWithEmployeeData,
    setEmployeeHR
  };
}
