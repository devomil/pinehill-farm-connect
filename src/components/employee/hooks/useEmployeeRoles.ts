
import { useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useEmployeeRoles(employee: User | null) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{[key: string]: boolean}>({
    admin: false,
    employee: false,
    hr: false,
    manager: false
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
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', employeeId);
      if (error) throw error;
      if (data) {
        setUserRoles(data.map(role => ({
          id: role.id,
          userId: role.user_id,
          role: role.role as "admin" | "employee" | "hr" | "manager"
        })));
        const roleMap = {
          admin: false,
          employee: false,
          hr: false,
          manager: false
        };
        data.forEach(role => {
          roleMap[role.role as keyof typeof roleMap] = true;
        });
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
    setSelectedRoles({
      ...selectedRoles,
      [role]: checked
    });
  };

  const saveEmployeeRoles = async (employeeId: string) => {
    try {
      const currentRoles = userRoles.map(r => r.role);
      const newRoles: ("admin" | "employee" | "hr" | "manager")[] = [];
      
      Object.entries(selectedRoles).forEach(([role, selected]) => {
        if (selected) newRoles.push(role as "admin" | "employee" | "hr" | "manager");
      });
      
      const rolesToAdd = newRoles.filter(r => !currentRoles.includes(r));
      const rolesToRemove = currentRoles.filter(r => !newRoles.includes(r as ("admin" | "employee" | "hr" | "manager")));

      if (rolesToAdd.length > 0) {
        const newRoleRecords = rolesToAdd.map(role => ({
          user_id: employeeId,
          role: role
        }));
        const { error } = await supabase
          .from('user_roles')
          .insert(newRoleRecords as { user_id: string; role: "admin" | "employee" | "hr" | "manager" }[]);
        if (error) throw error;
      }
      
      if (rolesToRemove.length > 0) {
        for (const role of rolesToRemove) {
          const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', employeeId)
            .eq('role', role);
          if (error) throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving employee roles:', error);
      toast.error('Failed to save employee roles');
      return false;
    }
  };

  return {
    userRoles,
    selectedRoles,
    isLoading: isLoading,
    handleRoleChange,
    saveEmployeeRoles
  };
}
