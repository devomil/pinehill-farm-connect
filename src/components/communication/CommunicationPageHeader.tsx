
import React from 'react';
import { CommunicationHeader } from "./CommunicationHeader";
import { DebugButton } from "@/components/debug/DebugButton";
import { User } from "@/types";

interface CommunicationPageHeaderProps {
  isAdmin: boolean;
  unfilteredEmployees: User[];
  onAnnouncementCreate: (formData: any) => void;
  onManualRefresh: () => void;
  showDebugInfo: boolean;
  setShowDebugInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CommunicationPageHeader: React.FC<CommunicationPageHeaderProps> = ({
  isAdmin,
  unfilteredEmployees,
  onAnnouncementCreate,
  onManualRefresh,
  showDebugInfo,
  setShowDebugInfo
}) => {
  return (
    <div className="w-full">
      <CommunicationHeader 
        isAdmin={isAdmin}
        allEmployees={unfilteredEmployees}
        onAnnouncementCreate={onAnnouncementCreate}
        onManualRefresh={onManualRefresh}
        showDebugInfo={showDebugInfo}
        setShowDebugInfo={setShowDebugInfo}
      />
      
      <div className="flex justify-end">
        <DebugButton 
          variant="outline" 
          className="text-xs"
          onClick={() => setShowDebugInfo(!showDebugInfo)} 
        />
      </div>
    </div>
  );
};
