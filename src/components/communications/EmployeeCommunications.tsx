
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useEmployees } from "@/hooks/useEmployees";
import { useCommunications } from "@/hooks/useCommunications";
import { NewMessageDialog } from "./NewMessageDialog";
import { MessageList } from "./MessageList";

export function EmployeeCommunications() {
  const { unfilteredEmployees } = useEmployees();
  const { messages, isLoading, sendMessage, respondToShiftRequest } = useCommunications();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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

      <Card className="p-4">
        <MessageList
          messages={messages || []}
          isLoading={isLoading}
          onRespond={respondToShiftRequest}
          employees={unfilteredEmployees}
        />
      </Card>
    </div>
  );
}
