
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useCommunications } from "@/hooks/useCommunications";
import { NewMessageDialog } from "./NewMessageDialog";
import { MessageList } from "./MessageList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RespondToShiftRequestParams } from "@/types/communications/communicationTypes";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { useEmployeeAssignments } from "@/hooks/useEmployeeAssignments";

export function EmployeeCommunications() {
  const { currentUser } = useAuth();
  const { unfilteredEmployees: allEmployees, loading: employeesLoading } = useEmployeeDirectory();
  const { assignments } = useEmployeeAssignments();
  const { messages, isLoading, sendMessage, respondToShiftRequest } = useCommunications();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Add the current user ID to each message object for the MessageList component
  const messagesWithCurrentUser = React.useMemo(() => {
    if (!messages || !currentUser) return [];
    return messages.map(msg => ({
      ...msg,
      current_user_id: currentUser.id
    }));
  }, [messages, currentUser]);

  // Create a handler function that calls the mutation's mutate function
  const handleRespondToShiftRequest = (data: RespondToShiftRequestParams) => {
    respondToShiftRequest(data);
  };

  const handleSendMessage = (data: any) => {
    sendMessage(data);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground flex items-center">
          <UserCheck className="h-4 w-4 mr-1" />
          {allEmployees?.length > 0 ? (
            <span>
              {allEmployees.length} employee{allEmployees.length !== 1 ? 's' : ''} available for communication
            </span>
          ) : (
            <span>No other employees found</span>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Message</Button>
          </DialogTrigger>
          <NewMessageDialog
            employees={allEmployees || []}
            onSend={handleSendMessage}
            onClose={() => setDialogOpen(false)}
          />
        </Dialog>
      </div>

      {allEmployees?.length <= 1 && (
        <Alert className="bg-amber-50 border-amber-300">
          <AlertCircle className="h-4 w-4 text-amber-800" />
          <AlertDescription className="text-amber-800">
            You can only see yourself in the employee list. This is likely due to a database permission issue or because no other employees have been created yet. Try clicking "Fix Assignments" in the Reports page.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <MessageList
          messages={messagesWithCurrentUser}
          isLoading={isLoading || employeesLoading}
          onRespond={handleRespondToShiftRequest}
          employees={allEmployees || []}
        />
      </Card>
    </div>
  );
}
