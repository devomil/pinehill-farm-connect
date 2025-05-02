
import React from "react";
import { Card } from "@/components/ui/card";
import { EmployeeList } from "./EmployeeList";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeeListViewProps {
  employees: User[];
  loading: boolean;
  onSelectEmployee: (employee: User) => void;
  selectedEmployee?: User | null;
  onRefresh: () => void;
  messages?: Communication[];
  unreadMessages?: Communication[];
  error?: any;
}

export function EmployeeListView({
  employees,
  loading,
  onSelectEmployee,
  selectedEmployee = null,
  onRefresh,
  messages = [],
  unreadMessages = [],
  error
}: EmployeeListViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Handle error display
  if (error && !loading) {
    return (
      <Card className="md:col-span-1 p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading employees: {error?.message || "Unknown error"}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
        
        <div className="p-4 text-center">
          <Button 
            variant="default" 
            onClick={onRefresh}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Employee List
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-1 p-4">
      <EmployeeList
        employees={employees}
        isLoading={loading}
        onSelectEmployee={onSelectEmployee}
        selectedEmployee={selectedEmployee}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadMessages={unreadMessages}
        onRefresh={onRefresh}
      />
    </Card>
  );
}
