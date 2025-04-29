
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmployeeCommunications } from "@/components/communications/EmployeeCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Mail, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageList } from "@/components/communications/MessageList";
import { useCommunications } from "@/hooks/useCommunications";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { NewMessageDialog } from "@/components/communications/NewMessageDialog";
import { User } from "@/types";

export default function Communications() {
  const { currentUser } = useAuth();
  const { loading: employeesLoading, error: employeeError, refetch: refetchEmployees, unfilteredEmployees: allEmployees } = useEmployeeDirectory();
  const { isLoading: assignmentsLoading } = useEmployeeAssignments();
  const { messages, isLoading: messagesLoading, respondToShiftRequest, sendMessage, unreadMessages, refreshMessages, error: messagesError } = useCommunications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const loading = employeesLoading || assignmentsLoading || messagesLoading;
  const error = employeeError || messagesError; // Combine errors from both hooks

  useEffect(() => {
    console.log("Communications page loaded with user:", currentUser?.email);
    // Attempt to load employees when page loads
    refetchEmployees();
    // Set a refresh interval for messages (every 30 seconds)
    const refreshInterval = setInterval(() => {
      refreshMessages();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [currentUser, refetchEmployees, refreshMessages, retryCount]);

  const handleNewMessageSend = (data: any) => {
    sendMessage(data);
    setDialogOpen(false);
  };

  const handleViewConversation = (employee: User) => {
    setSelectedEmployee(employee);
    setActiveTab("conversation");
  };

  const handleRetry = () => {
    // Increment the retry count to trigger the useEffect
    setRetryCount(prev => prev + 1);
    // Run manual refetch operations
    refetchEmployees();
    refreshMessages();
  };

  const messagesWithCurrentUser = React.useMemo(() => {
    if (!messages || !currentUser) return [];
    return messages.map(msg => ({
      ...msg,
      current_user_id: currentUser.id
    }));
  }, [messages, currentUser]);

  const isConnectionError = error && error.includes("Failed to fetch");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Direct Messages</h1>
          <p className="text-muted-foreground">
            Message your colleagues directly and manage shift coverage requests
          </p>
        </div>
        
        {isConnectionError ? (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <WifiOff className="h-4 w-4 text-amber-800" />
            <AlertDescription className="text-amber-800 flex flex-col space-y-2">
              <p>There seems to be a connection issue. Unable to load messages.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-fit mt-2 border-amber-500 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                onClick={handleRetry}
              >
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading data: {error}
            </AlertDescription>
          </Alert>
        ) : null}
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading employee data...</span>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="inbox">
                      Inbox
                      {unreadMessages.length > 0 && (
                        <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                          {unreadMessages.length}
                        </span>
                      )}
                    </TabsTrigger>
                    {selectedEmployee && (
                      <TabsTrigger value="conversation">
                        Conversation with {selectedEmployee.name}
                      </TabsTrigger>
                    )}
                  </TabsList>
                  
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Mail className="h-4 w-4 mr-2" />
                        New Message
                      </Button>
                    </DialogTrigger>
                    <NewMessageDialog
                      employees={allEmployees || []}
                      onSend={handleNewMessageSend}
                      onClose={() => setDialogOpen(false)}
                    />
                  </Dialog>
                </div>
                
                <TabsContent value="inbox">
                  <Card className="p-4">
                    <MessageList
                      messages={messagesWithCurrentUser}
                      isLoading={loading}
                      onRespond={respondToShiftRequest}
                      employees={allEmployees || []}
                      onViewConversation={handleViewConversation}
                    />
                  </Card>
                </TabsContent>
                
                <TabsContent value="conversation">
                  <Card className="p-4">
                    <EmployeeCommunications
                      selectedEmployee={selectedEmployee}
                      setSelectedEmployee={setSelectedEmployee}
                    />
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
