
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { NewMessageDialog } from "./NewMessageDialog";
import { RefreshCcw, Send } from "lucide-react";
import { User } from "@/types";

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
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Employee Communications</h2>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            title="Refresh communications"
            onClick={onRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Button onClick={() => setDialogOpen(true)}>
          <Send className="mr-2 h-4 w-4" /> New Message
        </Button>
        <NewMessageDialog
          employees={allEmployees}
          onSend={handleNewMessageSend}
          onClose={() => setDialogOpen(false)}
          onRefresh={onRefresh}
        />
      </Dialog>
    </div>
  );
}
