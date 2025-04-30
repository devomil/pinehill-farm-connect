
import { useState } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import { useEmployeeData } from "./useEmployeeData";
import { useEmployeeHRData } from "./useEmployeeHRData";
import { useEmployeeRoles } from "./useEmployeeRoles";

export function useEmployeeDetail(employee: User | null, onEmployeeUpdate: () => void, onClose: () => void) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const {
    employeeData,
    setEmployeeData,
    handleBasicInfoChange,
    saveEmployeeBasicInfo
  } = useEmployeeData(employee);

  const {
    employeeHR,
    setEmployeeHR,
    handleHRDataChange,
    saveEmployeeHRData
  } = useEmployeeHRData(employee);

  const {
    selectedRoles,
    handleRoleChange,
    saveEmployeeRoles
  } = useEmployeeRoles(employee);

  const saveEmployeeData = async () => {
    if (!employeeData) return;
    setIsLoading(true);
    
    try {
      // First, save the basic profile information
      const basicInfoSuccess = await saveEmployeeBasicInfo();
      if (!basicInfoSuccess) throw new Error("Failed to save basic info");
      
      // Continue with updating HR data
      const hrSuccess = await saveEmployeeHRData(employeeData.id);
      if (!hrSuccess) throw new Error("Failed to save HR data");

      // Update user roles
      const rolesSuccess = await saveEmployeeRoles(employeeData.id);
      if (!rolesSuccess) throw new Error("Failed to save roles");

      toast.success('Employee data saved successfully');
      onEmployeeUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving employee data:', error);
      toast.error('Failed to save employee data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    employeeData,
    employeeHR,
    isLoading,
    selectedRoles,
    handleBasicInfoChange,
    handleHRDataChange,
    handleRoleChange,
    saveEmployeeData,
    setEmployeeHR
  };
}
