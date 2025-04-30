
import { useState, useEffect } from "react";
import { EmployeeHR, User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type EmploymentType = "" | "full-time" | "part-time" | "contract" | "seasonal" | "intern";

export function useEmployeeHRData(employee: User | null) {
  const [employeeHR, setEmployeeHR] = useState<EmployeeHR | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (employee) {
      fetchEmployeeHRData(employee.id);
    }
  }, [employee]);

  const fetchEmployeeHRData = async (employeeId: string) => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      console.log("Fetching HR data for employee:", employeeId);
      
      const { data, error } = await supabase
        .from('employee_hr')
        .select('*')
        .eq('user_id', employeeId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching employee HR data:', error);
        throw error;
      }
      
      if (data) {
        console.log("HR data found:", data);
        const transformedData: EmployeeHR = {
          id: data.id,
          userId: data.user_id,
          startDate: data.start_date ? new Date(data.start_date) : undefined,
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          salary: data.salary,
          employmentType: data.employment_type as EmploymentType,
          address: data.address,
          phone: data.phone,
          emergencyContact: data.emergency_contact,
          notes: data.notes,
        };
        setEmployeeHR(transformedData);
      } else {
        console.log("No HR data found, creating empty record");
        setEmployeeHR({
          id: '',
          userId: employeeId,
        });
      }
    } catch (error) {
      console.error('Error fetching employee HR data:', error);
      toast.error('Failed to fetch employee HR data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHRDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!employeeHR) return;
    
    // Handle different input types appropriately
    let value: string | number | Date | undefined = e.target.value;
    
    // Process date fields
    if (e.target.type === 'date' && value) {
      value = new Date(value);
    }
    
    // Process number fields
    if (e.target.type === 'number' && value) {
      value = Number(value);
    }
    
    setEmployeeHR({
      ...employeeHR,
      [e.target.name]: value,
    });
  };

  const saveEmployeeHRData = async (employeeId: string) => {
    if (!employeeHR) return false;
    
    try {
      console.log("Saving HR data for employee:", employeeId, employeeHR);
      
      const hrData = {
        user_id: employeeId,
        start_date: employeeHR.startDate ? new Date(employeeHR.startDate).toISOString().split('T')[0] : null,
        end_date: employeeHR.endDate ? new Date(employeeHR.endDate).toISOString().split('T')[0] : null,
        salary: employeeHR.salary,
        employment_type: employeeHR.employmentType,
        address: employeeHR.address,
        phone: employeeHR.phone,
        emergency_contact: employeeHR.emergencyContact,
        notes: employeeHR.notes
      };
      
      let result;
      
      if (employeeHR.id) {
        console.log("Updating existing HR record:", employeeHR.id);
        result = await supabase
          .from('employee_hr')
          .update(hrData)
          .eq('id', employeeHR.id);
      } else {
        console.log("Inserting new HR record");
        result = await supabase
          .from('employee_hr')
          .insert([hrData]);
      }
      
      if (result.error) {
        console.error('Error saving employee HR data:', result.error);
        throw result.error;
      }
      
      console.log("HR data saved successfully");
      return true;
    } catch (error) {
      console.error('Error saving employee HR data:', error);
      toast.error('Failed to save employee HR data');
      return false;
    }
  };

  return {
    employeeHR,
    setEmployeeHR,
    isLoading,
    handleHRDataChange,
    saveEmployeeHRData
  };
}
