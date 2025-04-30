
import { useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useEmployeeRoles(employee: User | null) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{[key: string]: boolean}>({
    admin: false,
    employee: true, // Default to employee role
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (employee) {
      fetchEmployeeRoles(employee.id);
    }
  }, [employee]);

  const fetchEmployeeRoles = async (employeeId: string) => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      console.log("Fetching roles for employee:", employeeId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', employeeId);
      
      if (error) {
        console.error('Error fetching employee roles:', error);
        throw error;
      }

      console.log("Fetched roles:", data);
      
      if (data) {
        setUserRoles(data.map(role => ({
          id: role.id,
          userId: role.user_id,
          role: role.role as "admin" | "employee" | "hr" | "manager"
        })));
        
        // Default roles
        const roleMap = {
          admin: false,
          employee: true, // Default to employee role
        };
        
        // If any roles are found, update the roleMap
        if (data.length > 0) {
          roleMap.admin = data.some(role => role.role === 'admin');
          roleMap.employee = data.some(role => role.role === 'employee') || !roleMap.admin; // Default to employee if not admin
        }
        
        console.log("Setting selectedRoles to:", roleMap);
        setSelectedRoles(roleMap);
      }
    } catch (error) {
      console.error('Error fetching employee roles:', error);
      toast.error('Failed to fetch employee roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    console.log(`Changing role ${role} to ${checked}`);
    
    // For radio button behavior
    if (role === 'admin' && checked) {
      setSelectedRoles({
        admin: true,
        employee: false
      });
    } else if (role === 'employee' && checked) {
      setSelectedRoles({
        admin: false,
        employee: true
      });
    } else {
      setSelectedRoles(prev => ({
        ...prev,
        [role]: checked
      }));
    }
  };

  const saveEmployeeRoles = async (employeeId: string) => {
    try {
      console.log(`Saving roles for employee ${employeeId}:`, selectedRoles);
      setIsLoading(true);
      // Get all current roles for this user
      const { data: existingRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', employeeId);
      
      if (fetchError) {
        console.error('Error fetching existing roles:', fetchError);
        throw fetchError;
      }
      
      console.log("Existing roles:", existingRoles);
      
      // Delete all existing roles
      if (existingRoles && existingRoles.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', employeeId);
        
        if (deleteError) {
          console.error('Error deleting existing roles:', deleteError);
          throw deleteError;
        }
        
        console.log("Deleted existing roles");
      }
      
      // Add new roles based on selectedRoles
      const newRoles = [];
      if (selectedRoles.admin) {
        newRoles.push({ user_id: employeeId, role: 'admin' });
      }
      if (selectedRoles.employee) {
        newRoles.push({ user_id: employeeId, role: 'employee' });
      }
      
      console.log("Inserting new roles:", newRoles);
      
      if (newRoles.length > 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(newRoles);
          
        if (insertError) {
          console.error('Error inserting new roles:', insertError);
          throw insertError;
        }
        
        console.log("Inserted new roles");
      }
      
      toast.success('Employee roles updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error saving employee roles:', error);
      toast.error(`Failed to save employee roles: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userRoles,
    selectedRoles,
    isLoading,
    handleRoleChange,
    saveEmployeeRoles
  };
}
