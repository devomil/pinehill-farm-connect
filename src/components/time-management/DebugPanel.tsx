
import React, { useState } from "react";
import { Bug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTimeManagement } from "@/contexts/timeManagement";

export const DebugPanel: React.FC = () => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const {
    activeTab,
    loading,
    error,
    userRequests,
    pendingRequests,
    processedMessages,
    messagesLoading,
    messagesError,
    handleRetry,
    refreshMessages,
    fetchRequests,
    forceRefreshData,
  } = useTimeManagement();

  return (
    <>
      {/* Debug toggle button */}
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="h-8 text-xs"
        >
          <Bug className="h-3 w-3 mr-1" /> {showDebugInfo ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>

      {/* Debug information panel */}
      {showDebugInfo && (
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="debug-info">
            <AccordionTrigger className="text-sm">Time Management Debug Information</AccordionTrigger>
            <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
              <p><strong>Active Tab:</strong> {activeTab}</p>
              <p><strong>Loading state:</strong> {loading ? "true" : "false"}</p>
              <p><strong>Messages Loading state:</strong> {messagesLoading ? "true" : "false"}</p>
              <p><strong>User requests count:</strong> {userRequests?.length || 0}</p>
              <p><strong>Pending requests count:</strong> {pendingRequests?.length || 0}</p>
              <p><strong>Processed messages count:</strong> {processedMessages?.length || 0}</p>
              
              {error && (
                <>
                  <p className="mt-2 font-semibold text-red-500">Error:</p>
                  <pre className="whitespace-pre-wrap text-red-500">
                    {typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)}
                  </pre>
                </>
              )}
              
              {messagesError && (
                <>
                  <p className="mt-2 font-semibold text-red-500">Messages Error:</p>
                  <pre className="whitespace-pre-wrap text-red-500">
                    {typeof messagesError === 'object' ? JSON.stringify(messagesError, null, 2) : String(messagesError)}
                  </pre>
                </>
              )}

              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={forceRefreshData} className="mr-2">
                  Force Refresh All
                </Button>
                <Button size="sm" variant="outline" onClick={fetchRequests} className="mr-2">
                  Refresh Requests
                </Button>
                <Button size="sm" variant="outline" onClick={refreshMessages}>
                  Refresh Messages
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
