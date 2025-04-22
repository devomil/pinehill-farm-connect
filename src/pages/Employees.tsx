
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { User as UserType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  
  // Mock employee data (would come from Supabase in a real implementation)
  const [employees, setEmployees] = useState<UserType[]>([
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
  ]);

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle adding a new employee (placeholder for now)
  const handleAddEmployee = () => {
    toast.info("This feature is coming soon!");
  };

  // Handle editing an employee (placeholder for now)
  const handleEditEmployee = (id: string) => {
    toast.info(`Edit employee with ID ${id} - Coming soon!`);
  };

  // Handle deleting an employee (placeholder for now)
  const handleDeleteEmployee = (id: string) => {
    toast.info(`Delete employee with ID ${id} - Coming soon!`);
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
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees by name, email, department..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          employee.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {employee.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditEmployee(employee.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
