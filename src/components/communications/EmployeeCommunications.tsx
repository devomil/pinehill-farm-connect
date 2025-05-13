
import React, { useState, useEffect, useRef } from "react";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useCommunications } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";
import { useResponsiveLayout } from "@/hooks/communications/useResponsiveLayout";
import { useProcessMessages } from "@/hooks/communications/useProcessMessages";
import { toast } from "sonner";
import { EmployeeCommunicationError } from "./EmployeeCommunicationError";
import { EmployeeCommunicationMobile } from "./EmployeeCommunicationMobile";
import { EmployeeCommunicationDesktop } from "./EmployeeCommunicationDesktop";

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
  const { messages, isLoading: messagesLoading, sendMessage, refreshMessages, error: messagesError, unreadMessages } = useCommunications(true);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(propSelectedEmployee || null);
  const { isMobileView } = useResponsiveLayout();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Use refs to prevent excessive refreshing
  const initialLoadComplete = useRef(false);
  const componentMounted = useRef(false);
  
  const processedMessages = useProcessMessages(messages, currentUser);
  const loading = employeesLoading || messagesLoading;
  const error = employeeError || messagesError;

  // Sync with prop if changed externally
  useEffect(() => {
    if (propSelectedEmployee !== undefined && propSelectedEmployee !== selectedEmployee) {
      setSelectedEmployee(propSelectedEmployee);
    }
  }, [propSelectedEmployee]);

  // Force a refresh when retryCount changes
  useEffect(() => {
    if (retryCount > 0) {
      console.log(`Retrying employee fetch due to retryCount: ${retryCount}`);
      refetchEmployees();
      refreshMessages();
    }
  }, [retryCount, refetchEmployees, refreshMessages]);

  // Initial load effect with proper cleanup
  useEffect(() => {
    componentMounted.current = true;
    
    // Only load once on initial mount
    if (!initialLoadComplete.current && currentUser) {
      console.log("EmployeeCommunications - Initial data load");
      
      const loadData = async () => {
        try {
          await Promise.all([
            refetchEmployees(),
            refreshMessages()
          ]);
          
          if (componentMounted.current) {
            initialLoadComplete.current = true;
          }
        } catch (err) {
          console.error("Error loading communications data", err);
          if (componentMounted.current) {
            toast.error("Failed to load communications data. Please try again.");
          }
        }
      };
      
      loadData();
    }
    
    // Component cleanup
    return () => {
      componentMounted.current = false;
    };
  }, [currentUser, refetchEmployees, refreshMessages]);

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
      <EmployeeCommunicationError
        error={error}
        retryCount={retryCount}
        onRefresh={handleRefresh}
      />
    );
  }

  // For mobile layout, show either conversations list or specific conversation
  if (isMobileView) {
    return (
      <EmployeeCommunicationMobile
        selectedEmployee={selectedEmployee}
        processedMessages={processedMessages}
        loading={loading}
        unfilteredEmployees={unfilteredEmployees || []}
        showDebugInfo={showDebugInfo}
        setShowDebugInfo={setShowDebugInfo}
        handleSelectEmployee={handleSelectEmployee}
        sendMessage={sendMessage}
        handleRefresh={handleRefresh}
        error={error}
        employeesLoading={employeesLoading}
        messagesLoading={messagesLoading}
        currentUser={currentUser}
        unreadMessages={unreadMessages || []}
      />
    );
  }

  // For desktop layout, show both conversations list and selected conversation
  return (
    <EmployeeCommunicationDesktop
      selectedEmployee={selectedEmployee}
      processedMessages={processedMessages}
      loading={loading}
      unfilteredEmployees={unfilteredEmployees || []}
      showDebugInfo={showDebugInfo}
      setShowDebugInfo={setShowDebugInfo}
      handleSelectEmployee={handleSelectEmployee}
      sendMessage={sendMessage}
      handleRefresh={handleRefresh}
      error={error}
      employeesLoading={employeesLoading}
      messagesLoading={messagesLoading}
      currentUser={currentUser}
      unreadMessages={unreadMessages || []}
    />
  );
};
