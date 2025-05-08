
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { NewMessageDialog } from "./NewMessageDialog";
import { RefreshCw, Send } from "lucide-react";
import { User } from "@/types";
import { Heading } from "@/components/ui/heading";

interface EmployeeCommunicationsHeaderProps {
  setDialogOpen?: (open: boolean) => void;
  dialogOpen?: boolean;
  handleNewMessageSend?: (data: any) => void;
  allEmployees?: User[];
  onRefresh?: () => void;
  title?: string;
}

export function EmployeeCommunicationsHeader({
  setDialogOpen,
  dialogOpen = false,
  handleNewMessageSend = () => {},
  allEmployees = [],
  onRefresh,
  title = "Employee Communications"
}: EmployeeCommunicationsHeaderProps) {
  // If no setDialogOpen is provided, create a dummy one
  const handleDialogOpen = setDialogOpen || (() => {});
  
  return (
    <div className="flex flex-col space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <Heading title={title} />
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              title="Refresh communications"
              onClick={onRefresh}
              className="h-9"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          )}
          
          {setDialogOpen && (
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
              <Button onClick={() => handleDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" /> New Message
              </Button>
              <NewMessageDialog
                employees={allEmployees}
                onSend={handleNewMessageSend}
                onClose={() => handleDialogOpen(false)}
                onRefresh={onRefresh}
              />
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
