
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CommunicationErrorDisplay } from "../communication/CommunicationErrorDisplay";

interface EmployeeCommunicationErrorProps {
  error: any;
  retryCount: number;
  onRefresh: () => void;
}

export function EmployeeCommunicationError({
  error,
  retryCount,
  onRefresh
}: EmployeeCommunicationErrorProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <CommunicationErrorDisplay error={error} onRefresh={onRefresh} />
      
      {/* Debug toggle and panel */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
        >
          <Bug className="h-4 w-4 mr-1" /> {showDebugInfo ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>
      
      {showDebugInfo && (
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="debug-info">
            <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
            <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
              <p><strong>Retry count:</strong> {retryCount}</p>
              
              {error && (
                <>
                  <p className="mt-2 font-semibold text-red-500">Error Details:</p>
                  <pre className="whitespace-pre-wrap text-red-500">
                    {typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)}
                  </pre>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      <div className="p-4 text-center">
        <Button 
          variant="default" 
          onClick={onRefresh}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
        </Button>
      </div>
    </div>
  );
}
