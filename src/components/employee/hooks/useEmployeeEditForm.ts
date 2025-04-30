
import { useState, useEffect, useCallback } from "react";
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
  
  // Initialize the form with Zod schema
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
    },
    mode: "onSubmit" // Changed from onBlur to onSubmit for better performance
  });

  // Memoize resetFormWithEmployeeData to prevent unnecessary re-renders
  const resetFormWithEmployeeData = useCallback(() => {
    if (!employee) return;
    
    try {
      console.log("Resetting form with employee data:", employee.name);
      
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
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
        }
      });
    } catch (err) {
      console.error("Error resetting form:", err);
    }
  }, [employee, employeeHR, form]);

  const handleSubmit = async (data: EmployeeFormValues) => {
    if (!employee) return;
    
    console.log("Submit function called with data:", data);
    
    // Prevent double submissions
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate submit");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Form submission started");
      
      // Create a deep copy of the employeeData and employeeHR objects before modifying
      const updatedEmployeeData = employeeData ? JSON.parse(JSON.stringify(employeeData)) : null;
      const updatedEmployeeHR = employeeHR ? JSON.parse(JSON.stringify(employeeHR)) : null;
      
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
      
      console.log("Calling saveEmployeeData with updated values");
      // Save all data at once
      const success = await saveEmployeeData();
      
      if (success) {
        toast.success("Employee data saved successfully");
        
        // Call onEmployeeUpdate and close the modal after a short delay
        setTimeout(() => {
          console.log("Employee update successful, calling onEmployeeUpdate");
          onEmployeeUpdate();
          handleClose();
        }, 300);
      } else {
        console.error("Save operation returned false");
        toast.error("Failed to save employee data");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Failed to save employee data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    // Delay form reset to prevent UI jank
    setTimeout(() => {
      form.reset();
      onClose();
    }, 100);
  }, [form, onClose]);

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
