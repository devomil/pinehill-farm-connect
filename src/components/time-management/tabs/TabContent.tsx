
import React from "react";
import { User } from "@/types";
import { TabsContent } from "@/components/ui/tabs";
import { UserTimeOffRequests } from "@/components/time-management/UserTimeOffRequests";
import { PendingTimeOffApprovals } from "@/components/time-management/PendingTimeOffApprovals";
import { TeamCalendar } from "@/components/time-management/TeamCalendar";
import { ShiftCoverageRequestsTab } from "@/components/time-management/shift-coverage";
import { useTimeManagement } from "@/contexts/timeManagement";

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
          onRefresh={refreshMessages}
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
        <TeamCalendar currentUser={currentUser} />
      </TabsContent>
    </>
  );
};
