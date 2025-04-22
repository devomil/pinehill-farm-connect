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
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogDescription } from "@/components/ui/alert-dialog";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetEmployee, setResetEmployee] = useState<UserType | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const { currentUser } = useAuth();
  const {
    selectedEmployee,
    isDetailModalOpen,
    openModal,
    closeModal
  } = useEmployeeModal();

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

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddEmployee = () => {
    toast.info("This feature is coming soon!");
  };
  const handleEditEmployee = (employee: UserType) => openModal(employee);
  const handleDeleteEmployee = (id: string) =>
    toast.info(`Delete employee with ID ${id} - Coming soon!`);
  const handleEmployeeUpdate = () => fetchEmployees();
  const handleResetPassword = (employee: UserType) => {
    setResetEmployee(employee);
  };
  const confirmResetPassword = async () => {
    if (!resetEmployee) return;
    setResetLoading(true);
    try {
      const res = await fetch("https://pdeaxfhsodenefeckabm.supabase.co/functions/v1/admin-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // no need to send auth header, handled via edge function service role
        },
        body: JSON.stringify({ email: resetEmployee.email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Password reset link sent to ${resetEmployee.email}.`);
      } else {
        toast.error(data.error || "Failed to send reset email.");
      }
    } catch (err) {
      toast.error("Failed to send reset email.");
    } finally {
      setResetLoading(false);
      setResetEmployee(null);
    }
  };

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
            onResetPassword={handleResetPassword}
            isAdmin={currentUser && currentUser.role === "admin"}
          />
        </CardContent>
      </Card>
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeModal}
        employee={selectedEmployee}
        onEmployeeUpdate={handleEmployeeUpdate}
      />
      <AlertDialog open={!!resetEmployee} onOpenChange={open => !open && setResetEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password?</AlertDialogTitle>
            <AlertDialogDescription>
              Send a password reset email to <b>{resetEmployee?.name}</b> ({resetEmployee?.email})? <br />
              This will allow the employee to set a new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword} disabled={resetLoading}>
              {resetLoading ? "Sending..." : "Send Reset Email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
