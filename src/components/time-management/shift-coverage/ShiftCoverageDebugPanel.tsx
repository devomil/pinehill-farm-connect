
import React from "react";
import { Communication } from "@/types/communications/communicationTypes";
import { User } from "@/types";

interface ShiftCoverageDebugPanelProps {
  showDebugInfo: boolean;
  setShowDebugInfo: (show: boolean) => void;
  shiftCoverageRequests: Communication[];
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  filter: 'all' | 'pending' | 'accepted' | 'declined';
  availableEmployees: User[];
  currentUser: User;
}

export const ShiftCoverageDebugPanel: React.FC<ShiftCoverageDebugPanelProps> = ({
  showDebugInfo,
  setShowDebugInfo,
  shiftCoverageRequests,
  pendingCount,
  acceptedCount,
  declinedCount,
  filter,
  availableEmployees,
  currentUser
}) => {
  if (!showDebugInfo) return null;

  return (
    <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-md text-xs">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Debug Information</h3>
        <button onClick={() => setShowDebugInfo(false)} className="text-red-600">Hide</button>
      </div>
      <div>
        <div><strong>Current User:</strong> {currentUser?.name} ({currentUser?.id})</div>
        <div><strong>Current Filter:</strong> {filter}</div>
        <div><strong>Total Requests:</strong> {shiftCoverageRequests?.length || 0}</div>
        <div><strong>Pending:</strong> {pendingCount}</div>
        <div><strong>Accepted:</strong> {acceptedCount}</div>
        <div><strong>Declined:</strong> {declinedCount}</div>
        <div><strong>Available Employees:</strong> {availableEmployees?.length || 0}</div>
      </div>
    </div>
  );
};
