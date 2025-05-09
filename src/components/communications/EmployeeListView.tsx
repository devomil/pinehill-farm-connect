
import React from "react";
import { Card } from "@/components/ui/card";
import { EmployeeList } from "./EmployeeList";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface EmployeeListViewProps {
  employees: User[];
  loading: boolean;
  onSelectEmployee: (employee: User) => void;
  selectedEmployee?: User | null;
  onRefresh: () => void;
  messages?: Communication[];
  unreadMessages?: Communication[];
  error?: any;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export function EmployeeListView({
  employees,
  loading,
  onSelectEmployee,
  selectedEmployee = null,
  onRefresh,
  messages = [],
  unreadMessages = [],
  error,
  searchQuery = "",
  setSearchQuery = () => {}
}: EmployeeListViewProps) {
  const [showDebugInfo, setShowDebugInfo] = React.useState(false);

  // Handle error display with debugging info
  if (error && !loading) {
    return (
      <Card className="md:col-span-1 p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading employees: {typeof error === 'string' ? error : error?.message || "Unknown error"}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
        
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="debug-info">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center">
                <Bug className="h-3 w-3 mr-1" /> Debug Information
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
              <p className="font-semibold">Error Details:</p>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(error, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="p-4 text-center">
          <Button 
            variant="default" 
            onClick={onRefresh}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Employee List
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-1 p-4">
      {/* Add debug toggle button */}
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
            <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
            <AccordionContent className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
              <p><strong>Loading state:</strong> {loading ? "true" : "false"}</p>
              <p><strong>Employees count:</strong> {employees?.length || 0}</p>
              <p><strong>Messages count:</strong> {messages?.length || 0}</p>
              <p><strong>Unread messages count:</strong> {unreadMessages?.length || 0}</p>
              <p><strong>Has selected employee:</strong> {selectedEmployee ? "true" : "false"}</p>
              <p><strong>Current search query:</strong> "{searchQuery}"</p>
              
              <p className="mt-2 font-semibold">Employee preview:</p>
              <pre className="whitespace-pre-wrap">
                {employees && employees.length > 0 
                  ? JSON.stringify(employees.slice(0, 3), null, 2) 
                  : 'No employees available'}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      <EmployeeList
        employees={employees}
        isLoading={loading}
        onSelectEmployee={onSelectEmployee}
        selectedEmployee={selectedEmployee}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadMessages={unreadMessages}
        onRefresh={onRefresh}
      />
    </Card>
  );
}
