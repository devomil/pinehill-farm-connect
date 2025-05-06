
import React from "react";
import { User } from "@/types";

interface ShiftCoverageErrorDebugPanelProps {
  loading: boolean;
  employeesLoading: boolean;
  messagesCount: number;
  employeeCount: number;
  currentUser: User;
  error: any;
  employeesError: any;
}

export const ShiftCoverageErrorDebugPanel: React.FC<ShiftCoverageErrorDebugPanelProps> = ({
  loading,
  employeesLoading,
  messagesCount,
  employeeCount,
  currentUser,
  error,
  employeesError
}) => {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-md text-xs">
      <h3 className="font-bold text-red-800 mb-2">Error Debug Information</h3>
      <div className="space-y-1">
        <div><strong>Loading State:</strong> {loading ? "Loading" : "Not Loading"}</div>
        <div><strong>Employees Loading:</strong> {employeesLoading ? "Loading" : "Not Loading"}</div>
        <div><strong>Messages Count:</strong> {messagesCount}</div>
        <div><strong>Employee Count:</strong> {employeeCount}</div>
        <div><strong>Current User:</strong> {currentUser?.name} ({currentUser?.id})</div>
        
        <div className="mt-2"><strong>Error:</strong></div>
        <div className="whitespace-pre-wrap text-red-600 p-1 bg-red-100 rounded">
          {error ? (typeof error === 'string' ? error : JSON.stringify(error, null, 2)) : 'None'}
        </div>
        
        <div className="mt-2"><strong>Employees Error:</strong></div>
        <div className="whitespace-pre-wrap text-red-600 p-1 bg-red-100 rounded">
          {employeesError ? (typeof employeesError === 'string' ? employeesError : JSON.stringify(employeesError, null, 2)) : 'None'}
        </div>
      </div>
    </div>
  );
};
