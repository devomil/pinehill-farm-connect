
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { User } from "@/types";
import { NewMessageDialog } from "./NewMessageDialog";

interface EmployeeCommunicationsHeaderProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  handleNewMessageSend: (data: any) => void;
  allEmployees: User[];
}

export function EmployeeCommunicationsHeader({
  dialogOpen,
  setDialogOpen,
  handleNewMessageSend,
  allEmployees
}: EmployeeCommunicationsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground flex items-center">
        <MessageSquare className="h-4 w-4 mr-1" />
        <span>Direct messages</span>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>New Message</Button>
        </DialogTrigger>
        <NewMessageDialog
          employees={allEmployees}
          onSend={handleNewMessageSend}
          onClose={() => setDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
}
