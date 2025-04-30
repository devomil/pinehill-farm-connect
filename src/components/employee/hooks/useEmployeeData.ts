
import { useState, useEffect } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useEmployeeData(employee: User | null) {
  const [employeeData, setEmployeeData] = useState<User | null>(null);

  useEffect(() => {
    if (employee) {
      setEmployeeData(employee);
    }
  }, [employee]);

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!employeeData) return;
    
    setEmployeeData({
      ...employeeData,
      [e.target.name]: e.target.value,
    });
  };

  const saveEmployeeBasicInfo = async () => {
    if (!employeeData) return false;
    
    try {
      console.log("Updating profile with data:", {
        name: employeeData.name,
        department: employeeData.department,
        position: employeeData.position,
        employeeId: employeeData.employeeId,
      });
      
      // Update the basic profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: employeeData.name || '',
          department: employeeData.department || '',
          position: employeeData.position || '',
          employeeId: employeeData.employeeId || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeData.id);
        
      if (profileError) {
        console.error('Error updating employee profile:', profileError);
        throw profileError;
      }
      
      console.log("Profile updated successfully");
      return true;
    } catch (error) {
      console.error('Error saving employee data:', error);
      toast.error('Failed to save employee basic info');
      return false;
    }
  };

  return {
    employeeData,
    setEmployeeData,
    handleBasicInfoChange,
    saveEmployeeBasicInfo
  };
}
