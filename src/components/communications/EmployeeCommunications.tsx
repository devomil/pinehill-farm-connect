
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useEmployees } from "@/hooks/useEmployees";
import { useCommunications } from "@/hooks/useCommunications";
import { NewMessageDialog } from "./NewMessageDialog";
import { MessageList } from "./MessageList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function EmployeeCommunications() {
  const { currentUser } = useAuth();
  const { unfilteredEmployees, loading } = useEmployees();
  const { messages, isLoading, sendMessage, respondToShiftRequest } = useCommunications();

  // Add the current user ID to each message object for the MessageList component
  const messagesWithCurrentUser = React.useMemo(() => {
    if (!messages || !currentUser) return [];
    return messages.map(msg => ({
      ...msg,
      current_user_id: currentUser.id
    }));
  }, [messages, currentUser]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground flex items-center">
          <UserCheck className="h-4 w-4 mr-1" />
          {unfilteredEmployees.length > 0 ? (
            <span>
              {unfilteredEmployees.length} employee{unfilteredEmployees.length !== 1 ? 's' : ''} available for communication
            </span>
          ) : (
            <span>No other employees found</span>
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Message</Button>
          </DialogTrigger>
          <NewMessageDialog
            employees={unfilteredEmployees}
            onSend={sendMessage}
          />
        </Dialog>
      </div>

      {unfilteredEmployees.length <= 1 && (
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
          isLoading={isLoading || loading}
          onRespond={respondToShiftRequest}
          employees={unfilteredEmployees}
        />
      </Card>
    </div>
  );
}
