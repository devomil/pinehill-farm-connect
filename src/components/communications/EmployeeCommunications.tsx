
import React from "react";
import { Card } from "@/components/ui/card";
import { User } from "@/types";
import { EmployeeCommunicationsHeader } from "./EmployeeCommunicationsHeader";
import { EmployeeAlert } from "./EmployeeAlert";
import { EmployeeDropdownSelect } from "./EmployeeDropdownSelect";
import { EmployeeConversationView } from "./EmployeeConversationView";
import { useEmployeeCommunications } from "@/hooks/communications/useEmployeeCommunications";
import { Communication } from "@/types/communications/communicationTypes";
import { Badge } from "@/components/ui/badge";

interface EmployeeCommunicationsProps {
  selectedEmployee?: User | null;
  setSelectedEmployee?: (employee: User | null) => void;
}

export function EmployeeCommunications({ 
  selectedEmployee: propSelectedEmployee, 
  setSelectedEmployee: propSetSelectedEmployee 
}: EmployeeCommunicationsProps = {}) {
  const {
    allEmployees,
    isLoading,
    selectedEmployee,
    searchQuery,
    setSearchQuery,
    dialogOpen,
    setDialogOpen,
    handleSelectEmployee,
    handleSendMessage,
    handleNewMessageSend,
    handleRefresh,
    unreadMessages,
    processedMessages,
    isMobileView,
    setSelectedEmployee,
    recentConversations,
    pendingShiftRequests
  } = useEmployeeCommunications({
    selectedEmployee: propSelectedEmployee,
    setSelectedEmployee: propSetSelectedEmployee
  });
  
  // Only show the alert if there are 0 or 1 employees (just the current user)
  const showEmployeeAlert = allEmployees?.length <= 1;
  
  return (
    <div className="space-y-4">
      <EmployeeCommunicationsHeader 
        setDialogOpen={setDialogOpen}
        dialogOpen={dialogOpen}
        handleNewMessageSend={handleNewMessageSend}
        allEmployees={allEmployees || []}
        onRefresh={handleRefresh}
      />

      {showEmployeeAlert && <EmployeeAlert />}

      <div className="space-y-4">
        {pendingShiftRequests.length > 0 && (
          <Card className="p-4 border-2 border-orange-300 bg-orange-50">
            <h3 className="font-semibold flex items-center mb-2">
              <Badge variant="destructive" className="mr-2">URGENT</Badge>
              Pending Shift Coverage Requests ({pendingShiftRequests.length})
            </h3>
            <div className="space-y-2">
              {pendingShiftRequests.map(request => {
                const sender = allEmployees?.find(emp => emp.id === request.sender_id);
                const recipient = allEmployees?.find(emp => emp.id === request.recipient_id);
                const shiftDetails = request.shift_coverage_requests?.[0];
                
                return (
                  <div key={request.id} className="border rounded p-3 bg-white">
                    <div className="flex justify-between">
                      <span className="font-medium">{sender?.name || 'Unknown'} needs coverage</span>
                      <Badge variant="outline" className="bg-yellow-100">Pending</Badge>
                    </div>
                    {shiftDetails && (
                      <div className="text-sm mt-1">
                        <p>Date: {shiftDetails.shift_date}</p>
                        <p>Time: {shiftDetails.shift_start} - {shiftDetails.shift_end}</p>
                      </div>
                    )}
                    <button 
                      onClick={() => handleSelectEmployee(sender || recipient || null)} 
                      className="text-sm text-blue-600 mt-2"
                    >
                      View details
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
        
        {/* Employee Dropdown Selection */}
        <Card className="p-4">
          <EmployeeDropdownSelect
            employees={allEmployees || []}
            onSelectEmployee={handleSelectEmployee}
            selectedEmployee={selectedEmployee}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            unreadMessages={unreadMessages || []}
            recentConversations={recentConversations}
          />
        </Card>

        {/* Conversation View */}
        {selectedEmployee && (
          <Card className="md:col-span-2 p-4">
            <EmployeeConversationView
              selectedEmployee={selectedEmployee}
              messages={processedMessages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onBack={() => {
                setSelectedEmployee(null);
                if (propSetSelectedEmployee) {
                  propSetSelectedEmployee(null);
                }
              }}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
