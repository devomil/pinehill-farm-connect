
import React from "react";
import { User } from "@/types";
import { TabsContent } from "@/components/ui/tabs";
import { UserTimeOffRequests } from "@/components/time-management/UserTimeOffRequests";
import { PendingTimeOffApprovals } from "@/components/time-management/PendingTimeOffApprovals";
import { ShiftCoverageRequestsTab } from "@/components/time-management/shift-coverage";
import { WorkScheduleTab } from "@/components/time-management/work-schedule";
import { useTimeManagement } from "@/contexts/timeManagement";
import { toast } from "sonner";

interface TabContentProps {
  currentUser: User;
  isAdmin: boolean;
}

export const TabContent: React.FC<TabContentProps> = ({ currentUser, isAdmin }) => {
  const {
    activeTab,
    userRequests,
    loading,
    error,
    fetchRequests,
    pendingRequests,
    processedMessages,
    messagesLoading,
    messagesError,
    respondToShiftRequest,
    refreshMessages
  } = useTimeManagement();

  // Keep a ref to track if the component is mounted to prevent navigation loops
  const isMounted = React.useRef(true);
  const toastIdRef = React.useRef<string | null>(null);
  
  // Clean up effect to track component mount status and clear any pending toasts
  React.useEffect(() => {
    isMounted.current = true;
    
    // Clear any existing toast when the component mounts
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    
    return () => {
      isMounted.current = false;
      
      // Clear any remaining toast when the component unmounts
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, []);
  
  // Safe refresh function that checks mount status first
  const safeRefresh = React.useCallback(() => {
    if (isMounted.current) {
      return refreshMessages();
    }
    return Promise.resolve();
  }, [refreshMessages]);

  return (
    <>
      <TabsContent value="my-requests" className="space-y-4 pt-4">
        <UserTimeOffRequests
          userRequests={userRequests || []}
          loading={loading}
          refresh={fetchRequests}
          error={error}
        />
      </TabsContent>
        
      <TabsContent value="shift-coverage" className="space-y-4 pt-4">
        <ShiftCoverageRequestsTab
          messages={processedMessages || []}
          loading={messagesLoading}
          onRespond={respondToShiftRequest}
          currentUser={currentUser}
          onRefresh={safeRefresh}
          error={messagesError}
        />
      </TabsContent>
      
      {isAdmin && (
        <TabsContent value="pending-approvals" className="space-y-4 pt-4">
          <PendingTimeOffApprovals 
            pendingRequests={pendingRequests || []} 
            refresh={fetchRequests} 
          />
        </TabsContent>
      )}
      
      <TabsContent value="team-calendar" className="pt-4">
        {/* No calendar here - it's now at the top of the page */}
        <div className="text-center text-muted-foreground pt-4">
          Calendar view is now available at the top of the page
        </div>
      </TabsContent>
      
      <TabsContent value="work-schedules" className="pt-4">
        <WorkScheduleTab 
          currentUser={currentUser}
          isAdmin={isAdmin}
        />
      </TabsContent>
    </>
  );
};
