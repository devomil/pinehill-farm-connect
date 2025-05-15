
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { createDebugContext } from "@/utils/debugUtils";

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
  const debug = createDebugContext('EmployeeCommunications');
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
  const lastRefreshTime = useRef(Date.now());
  const refreshTimeoutRef = useRef<number | null>(null);
  const renderCount = useRef(0);
  
  // Track render count to detect excessive re-renders
  renderCount.current++;
  
  useEffect(() => {
    if (renderCount.current % 5 === 0) {
      debug.info(`EmployeeCommunications rendered ${renderCount.current} times`);
    }
  }, [debug]);
  
  const processedMessages = useProcessMessages(messages, currentUser);
  const loading = employeesLoading || messagesLoading;
  const error = employeeError || messagesError;

  // Sync with prop if changed externally
  useEffect(() => {
    if (propSelectedEmployee !== undefined && propSelectedEmployee !== selectedEmployee) {
      debug.info("Selected employee prop changed", { 
        from: selectedEmployee?.email, 
        to: propSelectedEmployee?.email 
      });
      setSelectedEmployee(propSelectedEmployee);
    }
  }, [propSelectedEmployee, selectedEmployee, debug]);

  // Force a refresh when retryCount changes
  useEffect(() => {
    if (retryCount > 0) {
      debug.info(`Retrying employee fetch due to retryCount: ${retryCount}`);
      refetchEmployees();
      refreshMessages();
    }
  }, [retryCount, refetchEmployees, refreshMessages, debug]);

  // Ensure component remains mounted
  useEffect(() => {
    componentMounted.current = true;
    
    debug.info("EmployeeCommunications mounted", {
      timestamp: new Date().toISOString(),
      messagesCount: messages?.length || 0
    });
    
    // Component cleanup
    return () => {
      debug.info("EmployeeCommunications unmounting", {
        timestamp: new Date().toISOString()
      });
      componentMounted.current = false;
      if (refreshTimeoutRef.current !== null) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [debug, messages?.length]);

  // Initial load effect with proper cleanup
  useEffect(() => {
    // Only load once on initial mount
    if (!initialLoadComplete.current && currentUser) {
      debug.info("Initial data load started");
      const loadingToast = toast.loading("Loading messages...");
      
      const loadData = async () => {
        try {
          await Promise.all([
            refetchEmployees(),
            refreshMessages()
          ]);
          
          if (componentMounted.current) {
            initialLoadComplete.current = true;
            lastRefreshTime.current = Date.now();
            toast.success("Messages loaded", { id: loadingToast });
            debug.info("Initial data load completed successfully");
          }
        } catch (err) {
          debug.error("Error loading communications data", err);
          if (componentMounted.current) {
            toast.error("Failed to load messages", { id: loadingToast });
          }
        }
      };
      
      loadData();
    }
    
  }, [currentUser, refetchEmployees, refreshMessages, debug]);

  const handleSelectEmployee = useCallback((employee: User) => {
    debug.info("Selected employee:", employee);
    setSelectedEmployee(employee);
    if (propSetSelectedEmployee) {
      propSetSelectedEmployee(employee);
    }
  }, [propSetSelectedEmployee, debug]);

  const handleRefresh = useCallback(() => {
    const now = Date.now();
    // Prevent multiple refreshes within a short time period
    if (now - lastRefreshTime.current < 5000) {
      toast.info("Already refreshed recently, please wait");
      return;
    }
    
    debug.info("Manual refresh triggered");
    const loadingToast = toast.loading("Refreshing messages...");
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current !== null) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    Promise.all([
      refetchEmployees(),
      refreshMessages()
    ]).then(() => {
      if (componentMounted.current) {
        lastRefreshTime.current = Date.now();
        toast.success("Messages refreshed", { id: loadingToast });
        debug.info("Manual refresh completed successfully");
      }
    }).catch(err => {
      debug.error("Refresh error", err);
      toast.error("Failed to refresh messages", { id: loadingToast });
    });
    
    // Also call parent's onRefresh if provided
    if (propsOnRefresh) {
      propsOnRefresh();
    }
  }, [refetchEmployees, refreshMessages, propsOnRefresh, debug]);

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
