
import { useState, useEffect } from "react";
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

  const saveEmployeeData = async (): Promise<boolean> => {
    if (!employeeData) {
      toast.error("No employee data to save");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Saving employee data for:", employeeData.name);
      console.log("Employee data before save:", employeeData);
      
      // First, save the basic profile information
      const basicInfoSuccess = await saveEmployeeBasicInfo();
      if (!basicInfoSuccess) {
        console.error("Failed to save basic info");
        throw new Error("Failed to save basic info");
      }
      
      console.log("Basic info saved successfully");
      
      // Continue with updating HR data if we have employee HR data
      if (employeeHR) {
        const hrSuccess = await saveEmployeeHRData(employeeData.id);
        if (!hrSuccess) {
          console.error("Failed to save HR data");
          throw new Error("Failed to save HR data");
        }
        console.log("HR data saved successfully");
      }

      // Update user roles
      const rolesSuccess = await saveEmployeeRoles(employeeData.id);
      if (!rolesSuccess) {
        console.error("Failed to save roles");
        throw new Error("Failed to save roles");
      }
      
      console.log("Roles saved successfully");

      toast.success('Employee data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving employee data:', error);
      toast.error('Failed to save employee data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return false;
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
