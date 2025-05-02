
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface CommunicationDebugPanelProps {
  activeTab: string;
  employeesLoading: boolean;
  employeeCount: number;
  unreadMessageCount: number;
  retryCount: number;
  currentUser: User | null;
  isAdmin: boolean;
  employeeError: any;
  messagesError: any;
  allEmployees: User[] | null;
  onRefreshEmployees: () => void;
  onRefreshMessages: () => void;
}

export const CommunicationDebugPanel: React.FC<CommunicationDebugPanelProps> = ({
  activeTab,
  employeesLoading,
  employeeCount,
  unreadMessageCount,
  retryCount,
  currentUser,
  isAdmin,
  employeeError,
  messagesError,
  allEmployees,
  onRefreshEmployees,
  onRefreshMessages
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="debug-info">
        <AccordionTrigger className="text-sm">Communication Debug Information</AccordionTrigger>
        <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
          <p><strong>Active tab:</strong> {activeTab}</p>
          <p><strong>Employees loading:</strong> {employeesLoading ? 'true' : 'false'}</p>
          <p><strong>Employee count:</strong> {employeeCount}</p>
          <p><strong>Unread messages:</strong> {unreadMessageCount}</p>
          <p><strong>Retry count:</strong> {retryCount}</p>
          <p><strong>Current user:</strong> {currentUser?.email} (ID: {currentUser?.id})</p>
          <p><strong>Is admin:</strong> {isAdmin ? 'true' : 'false'}</p>
          
          {employeeError && (
            <>
              <p className="mt-2 font-semibold text-red-500">Employee Error:</p>
              <pre className="whitespace-pre-wrap text-red-500">
                {typeof employeeError === 'object' ? JSON.stringify(employeeError, null, 2) : String(employeeError)}
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
          
          {allEmployees && allEmployees.length > 0 && (
            <>
              <p className="mt-2 font-semibold">Employee sample:</p>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(allEmployees.slice(0, 2), null, 2)}
              </pre>
            </>
          )}
          
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={onRefreshEmployees} className="mr-2">
              Refresh Employees
            </Button>
            <Button size="sm" variant="outline" onClick={onRefreshMessages}>
              Refresh Messages
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
