
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, EmployeeHR, UserRole } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch employee HR data and roles when modal opens
  useEffect(() => {
    if (isOpen && employee) {
      setEmployeeData(employee);
      fetchEmployeeHRData();
      fetchEmployeeRoles();
    }
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
        // Transform snake_case to camelCase
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
        
        // Initialize selected roles
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
      // Save basic info - in a real app this would update the user in Supabase Auth
      // For now, we'll just simulate success
      
      // Save HR data
      if (employeeHR) {
        // Transform camelCase to snake_case for Supabase
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
          // Update existing HR record
          const { error } = await supabase
            .from('employee_hr')
            .update(hrData)
            .eq('id', employeeHR.id);
            
          if (error) throw error;
        } else {
          // Insert new HR record
          const { error } = await supabase
            .from('employee_hr')
            .insert([hrData]);
            
          if (error) throw error;
        }
      }
      
      // Update roles
      // First, get current roles to compare
      const currentRoles = userRoles.map(r => r.role);
      const newRoles: ("admin" | "employee" | "hr" | "manager")[] = [];
      
      // Collect selected roles
      Object.entries(selectedRoles).forEach(([role, selected]) => {
        if (selected) newRoles.push(role as "admin" | "employee" | "hr" | "manager");
      });
      
      // Roles to add
      const rolesToAdd = newRoles.filter(r => !currentRoles.includes(r));
      
      // Roles to remove
      const rolesToRemove = currentRoles.filter(r => !newRoles.includes(r as ("admin" | "employee" | "hr" | "manager")));
      
      // Add new roles
      if (rolesToAdd.length > 0) {
        const newRoleRecords = rolesToAdd.map(role => ({
          user_id: employeeData.id,
          role: role
        }));
        
        const { error } = await supabase
          .from('user_roles')
          .insert(newRoleRecords);
          
        if (error) throw error;
      }
      
      // Remove roles
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
          
          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={employeeData.name || ''} 
                    onChange={handleBasicInfoChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    value={employeeData.email || ''} 
                    onChange={handleBasicInfoChange} 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    name="department"
                    value={employeeData.department || ''} 
                    onChange={handleBasicInfoChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position" 
                    name="position"
                    value={employeeData.position || ''} 
                    onChange={handleBasicInfoChange} 
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* HR Data Tab */}
          <TabsContent value="hr">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    name="startDate"
                    type="date"
                    value={employeeHR?.startDate ? new Date(employeeHR.startDate).toISOString().slice(0, 10) : ''} 
                    onChange={handleHRDataChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    name="endDate"
                    type="date"
                    value={employeeHR?.endDate ? new Date(employeeHR.endDate).toISOString().slice(0, 10) : ''} 
                    onChange={handleHRDataChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input 
                    id="salary" 
                    name="salary"
                    type="number"
                    value={employeeHR?.salary || ''} 
                    onChange={handleHRDataChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select 
                    value={employeeHR?.employmentType || ''} 
                    onValueChange={(value) => 
                      setEmployeeHR(prev => prev ? { ...prev, employmentType: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={employeeHR?.phone || ''} 
                    onChange={handleHRDataChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input 
                    id="emergencyContact" 
                    name="emergencyContact"
                    value={employeeHR?.emergencyContact || ''} 
                    onChange={handleHRDataChange} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address"
                    value={employeeHR?.address || ''} 
                    onChange={handleHRDataChange} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    name="notes"
                    value={employeeHR?.notes || ''} 
                    onChange={handleHRDataChange} 
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Roles Tab */}
          <TabsContent value="roles">
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-admin" 
                    checked={selectedRoles.admin}
                    onCheckedChange={(checked) => handleRoleChange('admin', !!checked)}
                  />
                  <Label htmlFor="role-admin">Admin (Full system access)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-hr" 
                    checked={selectedRoles.hr}
                    onCheckedChange={(checked) => handleRoleChange('hr', !!checked)}
                  />
                  <Label htmlFor="role-hr">HR (Access to employee data and HR functions)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-manager" 
                    checked={selectedRoles.manager}
                    onCheckedChange={(checked) => handleRoleChange('manager', !!checked)}
                  />
                  <Label htmlFor="role-manager">Manager (Can view employee data)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="role-employee" 
                    checked={selectedRoles.employee}
                    onCheckedChange={(checked) => handleRoleChange('employee', !!checked)}
                  />
                  <Label htmlFor="role-employee">Employee (Basic access)</Label>
                </div>
              </div>
            </div>
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
  );
}
