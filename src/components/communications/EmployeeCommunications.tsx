
import React, { useState, useEffect } from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { EmployeeListView } from "./EmployeeListView";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";
import { useResponsiveLayout } from "@/hooks/communications/useResponsiveLayout";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmployeeCommunicationsProps {
  selectedEmployee?: User | null;
  setSelectedEmployee?: React.Dispatch<React.SetStateAction<User | null>>;
  onRefresh?: () => void;
  retryCount?: number;
}

export const EmployeeCommunications: React.FC<EmployeeCommunicationsProps> = ({ 
  selectedEmployee: propSelectedEmployee,
  setSelectedEmployee: propSetSelectedEmployee,
  onRefresh: propsOnRefresh,
  retryCount = 0
}) => {
  const { currentUser } = useAuth();
  const { unfilteredEmployees, loading: employeesLoading, error: employeeError, refetch: refetchEmployees } = useEmployeeDirectory();
  // Exclude shift coverage messages from employee communications
  const { messages, isLoading: messagesLoading, sendMessage, refreshMessages, error: messagesError } = useCommunications(true);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(propSelectedEmployee || null);
  const { isMobileView } = useResponsiveLayout();
  
  const processedMessages = useProcessMessages(messages, currentUser);
  const loading = employeesLoading || messagesLoading;
  const error = employeeError || messagesError;

  // Force a refresh when retryCount changes
  useEffect(() => {
    if (retryCount > 0) {
      refetchEmployees();
      refreshMessages();
    }
  }, [retryCount, refetchEmployees, refreshMessages]);

  useEffect(() => {
    // When component mounts, ensure we have fresh employee data
    if (!unfilteredEmployees || unfilteredEmployees.length === 0) {
      console.log("No employees found, fetching fresh data");
      refetchEmployees();
    }
  }, [refetchEmployees, unfilteredEmployees]);
  
  const handleSelectEmployee = (employee: User) => {
    console.log("Selected employee:", employee);
    setSelectedEmployee(employee);
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing employee data and messages");
    refetchEmployees();
    refreshMessages();
    
    // Also call parent's onRefresh if provided
    if (propsOnRefresh) {
      propsOnRefresh();
    }
  };

  // Show error message if there's an issue
  if (error && !loading) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading communications data: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
        
        <div className="p-4 text-center">
          <Button 
            variant="default" 
            onClick={handleRefresh}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  // For mobile layout, show either conversations list or specific conversation
  if (isMobileView) {
    return selectedEmployee ? (
      <EmployeeConversationView
        selectedEmployee={selectedEmployee}
        messages={processedMessages}
        loading={loading}
        onBack={() => setSelectedEmployee(null)}
        onSendMessage={(message) => sendMessage({
          recipientId: selectedEmployee.id,
          message,
          type: 'general'
        })}
        onRefresh={handleRefresh}
      />
    ) : (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Employee Messages</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
        
        <EmployeeListView
          employees={unfilteredEmployees || []}
          messages={processedMessages}
          loading={loading}
          onSelectEmployee={handleSelectEmployee}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>
    );
  }

  // For desktop layout, show both conversations list and selected conversation
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-15rem)]">
      <div className="md:w-1/3 border-r pr-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Employees</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
        <EmployeeListView
          employees={unfilteredEmployees || []}
          messages={processedMessages}
          loading={loading}
          onSelectEmployee={handleSelectEmployee}
          selectedEmployee={selectedEmployee}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>
      <Separator orientation="vertical" className="hidden md:block" />
      <div className="md:w-2/3 pl-4 mt-4 md:mt-0">
        {selectedEmployee ? (
          <EmployeeConversationView
            selectedEmployee={selectedEmployee}
            messages={processedMessages}
            loading={loading}
            onSendMessage={(message) => {
              console.log(`Sending message to ${selectedEmployee.name} (${selectedEmployee.id})`);
              sendMessage({
                recipientId: selectedEmployee.id,
                message,
                type: 'general'
              });
            }}
            onRefresh={handleRefresh}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select an employee to view conversation
          </div>
        )}
      </div>
    </div>
  );
};
