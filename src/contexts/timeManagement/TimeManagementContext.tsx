
import React, { createContext, useContext } from "react";
import { TimeManagementContextType, TimeManagementProviderProps } from "./types";
import { useTimeManagementState } from "./useTimeManagementState";

// Create the context with undefined as initial value
const TimeManagementContext = createContext<TimeManagementContextType | undefined>(undefined);

// Hook to use the context
export const useTimeManagement = () => {
  const context = useContext(TimeManagementContext);
  if (context === undefined) {
    throw new Error("useTimeManagement must be used within a TimeManagementProvider");
  }
  return context;
};

// Provider component that wraps children with the context
export const TimeManagementProvider: React.FC<TimeManagementProviderProps> = ({
  children,
  currentUser,
}) => {
  const timeManagementState = useTimeManagementState(currentUser);

  return (
    <TimeManagementContext.Provider value={timeManagementState}>
      {children}
    </TimeManagementContext.Provider>
  );
};
