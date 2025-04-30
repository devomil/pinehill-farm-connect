
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, UserX, UserCheck, Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

export function EmployeeAssignments() {
  const { employees, unfilteredEmployees } = useEmployees();
  const { currentUser } = useAuth();
  const { assignments, isLoading, assignEmployee, removeAssignment } = useEmployeeAssignments();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");
  
  const adminUsers = unfilteredEmployees.filter(e => e.role === 'admin');

  // Filter employees based on search query and filter mode
  const filteredEmployees = employees
    .filter(employee => {
      // Text search filter
      const matchesSearch = 
        employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        false;
        
      // Assignment status filter
      const assignment = assignments?.find(a => a.employee_id === employee.id);
      if (filterMode === "assigned" && !assignment) return false;
      if (filterMode === "unassigned" && assignment) return false;
      
      return matchesSearch;
    });
    
  const getAssignedAdminName = (employeeId: string): string => {
    const assignment = assignments?.find(a => a.employee_id === employeeId);
    if (!assignment || !assignment.admin) return "None";
    return assignment.admin.name || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Employee-Admin Assignments</span>
          <Badge variant="outline" className="ml-2">
            {assignments?.length || 0} Total Assignments
          </Badge>
        </CardTitle>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <RadioGroup 
            defaultValue="all" 
            className="flex space-x-4"
            onValueChange={(value) => setFilterMode(value as "all" | "assigned" | "unassigned")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="assigned" id="assigned" />
              <Label htmlFor="assigned">Assigned</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unassigned" id="unassigned" />
              <Label htmlFor="unassigned">Unassigned</Label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees match your search criteria
            </div>
          ) : (
            filteredEmployees.map((employee) => {
              const assignment = assignments?.find(a => a.employee_id === employee.id);
              
              return (
                <Card key={employee.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <span>{employee.email}</span>
                          {employee.department && (
                            <span className="hidden sm:inline text-muted-foreground">•</span>
                          )}
                          <span>{employee.department}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        {assignment ? (
                          <>
                            <Badge variant="secondary" className="mr-2 py-1 px-3">
                              Assigned to: {getAssignedAdminName(employee.id)}
                            </Badge>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeAssignment.mutate(employee.id)}
                              title="Remove assignment"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select
                              onValueChange={(adminId) => 
                                assignEmployee.mutate({ employeeId: employee.id, adminId })
                              }
                            >
                              <SelectTrigger className="w-[180px] md:w-[220px]">
                                <SelectValue placeholder="Assign to admin" />
                              </SelectTrigger>
                              <SelectContent>
                                {adminUsers.length === 0 ? (
                                  <div className="p-2 text-sm text-muted-foreground">
                                    No admins available
                                  </div>
                                ) : (
                                  adminUsers.map((admin) => (
                                    <SelectItem 
                                      key={admin.id} 
                                      value={admin.id}
                                      disabled={admin.id === employee.id}
                                    >
                                      {admin.name || admin.email}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost" 
                              size="icon"
                              className="text-green-600"
                              disabled={adminUsers.length === 0}
                              onClick={() => {
                                // Assign to first available admin (not self)
                                const availableAdmin = adminUsers.find(a => a.id !== employee.id);
                                if (availableAdmin) {
                                  assignEmployee.mutate({ 
                                    employeeId: employee.id, 
                                    adminId: availableAdmin.id 
                                  });
                                }
                              }}
                              title="Quick assign"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
