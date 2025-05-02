
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { NewMessageDialog } from "./NewMessageDialog";
import { RefreshCcw, Send } from "lucide-react";
import { User } from "@/types";
import { Heading } from "@/components/ui/heading";

interface EmployeeCommunicationsHeaderProps {
  setDialogOpen: (open: boolean) => void;
  dialogOpen: boolean;
  handleNewMessageSend: (data: any) => void;
  allEmployees: User[];
  onRefresh?: () => void; // Add refresh function
}

export function EmployeeCommunicationsHeader({
  setDialogOpen,
  dialogOpen,
  handleNewMessageSend,
  allEmployees,
  onRefresh,
}: EmployeeCommunicationsHeaderProps) {
  return (
    <div className="flex flex-col space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <Heading title="Employee Communications" />
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              title="Refresh communications"
              onClick={onRefresh}
              className="h-9"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          )}
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={() => setDialogOpen(true)}>
              <Send className="h-4 w-4 mr-2" /> New Message
            </Button>
            <NewMessageDialog
              employees={allEmployees}
              onSend={handleNewMessageSend}
              onClose={() => setDialogOpen(false)}
              onRefresh={onRefresh}
            />
          </Dialog>
        </div>
      </div>
    </div>
  );
}
