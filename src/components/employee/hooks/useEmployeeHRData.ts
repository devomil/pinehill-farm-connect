
import { useState, useEffect } from "react";
import { EmployeeHR, User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from('employee_hr')
        .select('*')
        .eq('user_id', employeeId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        const transformedData: EmployeeHR = {
          id: data.id,
          userId: data.user_id,
          startDate: data.start_date ? new Date(data.start_date) : undefined,
          endDate: data.end_date ? new Date(data.end_date) : undefined,
          salary: data.salary,
          employmentType: data.employment_type,
          address: data.address,
          phone: data.phone,
          emergencyContact: data.emergency_contact,
          notes: data.notes,
        };
        setEmployeeHR(transformedData);
      } else {
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
      const hrData = {
        user_id: employeeId,
        start_date: employeeHR.startDate ? employeeHR.startDate.toISOString().split('T')[0] : null,
        end_date: employeeHR.endDate ? employeeHR.endDate.toISOString().split('T')[0] : null,
        salary: employeeHR.salary,
        employment_type: employeeHR.employmentType,
        address: employeeHR.address,
        phone: employeeHR.phone,
        emergency_contact: employeeHR.emergencyContact,
        notes: employeeHR.notes
      };
      
      if (employeeHR.id) {
        const { error } = await supabase
          .from('employee_hr')
          .update(hrData)
          .eq('id', employeeHR.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('employee_hr')
          .insert([hrData]);
        if (error) throw error;
      }
      
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
