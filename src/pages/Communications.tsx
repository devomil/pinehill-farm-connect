
import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmployeeCommunications } from "@/components/communications/EmployeeCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Communications() {
  const { currentUser } = useAuth();
  const { loading: employeesLoading, error: employeeError, refetch: refetchEmployees } = useEmployeeDirectory();
  const { isLoading: assignmentsLoading } = useEmployeeAssignments();
  
  const loading = employeesLoading || assignmentsLoading;
  const error = employeeError; // Only use the error from useEmployeeDirectory

  useEffect(() => {
    console.log("Communications page loaded with user:", currentUser?.email);
    // Attempt to load employees when page loads
    refetchEmployees();
  }, [currentUser, refetchEmployees]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Direct Messages</h1>
          <p className="text-muted-foreground">
            Message your colleagues directly and manage shift coverage requests
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading employees: {error}
            </AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading employee data...</span>
          </div>
        ) : (
          <EmployeeCommunications />
        )}
      </div>
    </DashboardLayout>
  );
}
