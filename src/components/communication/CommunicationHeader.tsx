
import React from "react";
import { User } from "@/types";
import { AdminAnnouncementDialog } from "./AdminAnnouncementDialog";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Bug } from "lucide-react";

interface CommunicationHeaderProps {
  isAdmin: boolean;
  allEmployees: User[];
  onAnnouncementCreate: () => void;
  loading?: boolean;
  onManualRefresh: () => void;
  showDebugInfo: boolean;
  setShowDebugInfo: (show: boolean) => void;
}

export const CommunicationHeader: React.FC<CommunicationHeaderProps> = ({
  isAdmin,
  allEmployees,
  onAnnouncementCreate,
  loading,
  onManualRefresh,
  showDebugInfo,
  setShowDebugInfo
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-start">
        <Heading 
          title="Communication Center" 
          description="View and manage company announcements and communications."
        />
        
        {/* Action buttons moved to top-right */}
        <div className="flex items-center space-x-2">
          {/* Admin new announcement button */}
          {isAdmin && !loading && (
            <AdminAnnouncementDialog 
              allEmployees={allEmployees} 
              onCreate={onAnnouncementCreate}
            />
          )}
          
          {isAdmin && loading && (
            <Button disabled className="mt-2">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onManualRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Debug toggle placed at bottom of header section */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
        >
          <Bug className="h-4 w-4 mr-1" />
          {showDebugInfo ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>
    </div>
  );
};
