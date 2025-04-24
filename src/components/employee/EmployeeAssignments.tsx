
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, UserX } from "lucide-react";

export function EmployeeAssignments() {
  const { employees } = useEmployees();
  const { currentUser } = useAuth();
  const { assignments, isLoading, assignEmployee, removeAssignment } = useEmployeeAssignments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Employee Assignments</h2>
      {employees.map((employee) => {
        const assignment = assignments?.find(a => a.employee_id === employee.id);
        
        return (
          <Card key={employee.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {assignment ? (
                    <>
                      <span className="text-sm text-muted-foreground mr-2">
                        Assigned to: {assignment.admin?.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAssignment.mutate(employee.id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Select
                      onValueChange={(adminId) => 
                        assignEmployee.mutate({ employeeId: employee.id, adminId })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees
                          .filter(e => e.role === 'admin' && e.id !== employee.id)
                          .map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
