
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, EmployeeHR, UserRole } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeBasicInfo } from "./EmployeeBasicInfo";
import { EmployeeHRData } from "./EmployeeHRData";
import { EmployeeRoles } from "./EmployeeRoles";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onEmployeeUpdate: () => void;
}

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdate,
}: EmployeeDetailModalProps) {
  const [employeeData, setEmployeeData] = useState<User | null>(null);
  const [employeeHR, setEmployeeHR] = useState<EmployeeHR | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRoles, setSelectedRoles] = useState<{[key: string]: boolean}>({
    admin: false,
    employee: false,
    hr: false,
    manager: false
  });

  useEffect(() => {
    if (isOpen && employee) {
      setEmployeeData(employee);
      fetchEmployeeHRData();
      fetchEmployeeRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, employee]);

  const fetchEmployeeHRData = async () => {
    if (!employee) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employee_hr')
        .select('*')
        .eq('user_id', employee.id)
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
          userId: employee.id,
        });
      }
    } catch (error) {
      console.error('Error fetching employee HR data:', error);
      toast.error('Failed to fetch employee HR data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeRoles = async () => {
    if (!employee) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', employee.id);
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

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!employeeData) return;
    setEmployeeData({
      ...employeeData,
      [e.target.name]: e.target.value,
    });
  };

  const handleHRDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!employeeHR) return;
    setEmployeeHR({
      ...employeeHR,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setSelectedRoles({
      ...selectedRoles,
      [role]: checked
    });
  };

  const saveEmployeeData = async () => {
    if (!employeeData) return;
    setIsLoading(true);
    try {
      // UPDATE: First, save the basic profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: employeeData.name,
          department: employeeData.department,
          position: employeeData.position
        })
        .eq('id', employeeData.id);
        
      if (profileError) {
        console.error('Error updating employee profile:', profileError);
        throw profileError;
      }
      
      // Continue with updating HR data
      if (employeeHR) {
        const hrData = {
          user_id: employeeData.id,
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
      }

      // Update user roles
      const currentRoles = userRoles.map(r => r.role);
      const newRoles: ("admin" | "employee" | "hr" | "manager")[] = [];
      Object.entries(selectedRoles).forEach(([role, selected]) => {
        if (selected) newRoles.push(role as "admin" | "employee" | "hr" | "manager");
      });
      const rolesToAdd = newRoles.filter(r => !currentRoles.includes(r));
      const rolesToRemove = currentRoles.filter(r => !newRoles.includes(r as ("admin" | "employee" | "hr" | "manager")));

      if (rolesToAdd.length > 0) {
        const newRoleRecords = rolesToAdd.map(role => ({
          user_id: employeeData.id,
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
            .eq('user_id', employeeData.id)
            .eq('role', role);
          if (error) throw error;
        }
      }

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

  if (!employeeData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details: {employeeData.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="hr">HR Data</TabsTrigger>
            <TabsTrigger value="roles">Roles & Access</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <EmployeeBasicInfo 
              employeeData={employeeData}
              handleBasicInfoChange={handleBasicInfoChange}
            />
          </TabsContent>
          <TabsContent value="hr">
            <EmployeeHRData 
              employeeHR={employeeHR}
              handleHRDataChange={handleHRDataChange}
              setEmployeeHR={setEmployeeHR}
            />
          </TabsContent>
          <TabsContent value="roles">
            <EmployeeRoles 
              selectedRoles={selectedRoles}
              handleRoleChange={handleRoleChange}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={saveEmployeeData} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
