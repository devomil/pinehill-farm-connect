import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeDetailModal } from "@/components/employee/EmployeeDetailModal";
import { EmployeeSearchBar } from "@/components/employee/EmployeeSearchBar";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { useEmployeeModal } from "@/hooks/useEmployeeModal";
import { supabase } from "@/integrations/supabase/client";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const {
    selectedEmployee,
    isDetailModalOpen,
    openModal,
    closeModal
  } = useEmployeeModal();

  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const mockEmployees: UserType[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@pinehillfarm.co",
          role: "employee",
          department: "Sales",
          position: "Associate"
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@pinehillfarm.co",
          role: "employee",
          department: "Production",
          position: "Team Lead"
        },
        {
          id: "3",
          name: "Robert Johnson",
          email: "robert@pinehillfarm.co",
          role: "admin",
          department: "Management",
          position: "Operations Manager"
        },
        {
          id: "4",
          name: "Sarah Williams",
          email: "sarah@pinehillfarm.co",
          role: "employee",
          department: "Customer Service",
          position: "Representative"
        }
      ];

      setEmployees(mockEmployees);
      /*
      // Uncomment the below for actual Supabase integration
      
      // This would need to be implemented with a proper admin function in Supabase
      // to securely fetch user data
      
      // First fetch user roles to determine primary role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (roleError) throw roleError;
      
      const rolesByUser = {};
      if (roleData) {
        roleData.forEach(role => {
          if (!rolesByUser[role.user_id]) {
            rolesByUser[role.user_id] = [];
          }
          rolesByUser[role.user_id].push(role.role);
        });
      }
      
      // Then fetch user data and merge with roles
      // Note: In a real app, we'd need a serverless function to securely fetch users from auth.users
      const fetchedEmployees = mockEmployees.map(emp => {
        const roles = rolesByUser[emp.id] || ['employee'];
        // Determine primary role (admin > hr > manager > employee)
        let primaryRole = 'employee';
        if (roles.includes('admin')) primaryRole = 'admin';
        else if (roles.includes('hr')) primaryRole = 'hr';
        else if (roles.includes('manager')) primaryRole = 'manager';
        
        return {
          ...emp,
          role: primaryRole
        };
      });
      
      setEmployees(fetchedEmployees);
      */
      
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle add/edit/delete employee
  const handleAddEmployee = () => {
    toast.info("This feature is coming soon!");
  };
  const handleEditEmployee = (employee: UserType) => openModal(employee);
  const handleDeleteEmployee = (id: string) =>
    toast.info(`Delete employee with ID ${id} - Coming soon!`);
  const handleEmployeeUpdate = () => fetchEmployees();

  return (
    <DashboardLayout requireAdmin={true}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <Button onClick={handleAddEmployee} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employees Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeSearchBar value={searchQuery} onChange={setSearchQuery} />
          <EmployeeTable
            employees={filteredEmployees}
            loading={loading}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
          />
        </CardContent>
      </Card>
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeModal}
        employee={selectedEmployee}
        onEmployeeUpdate={handleEmployeeUpdate}
      />
    </DashboardLayout>
  );
}
