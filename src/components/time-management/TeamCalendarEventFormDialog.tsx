
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamCalendarEventFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

export const TeamCalendarEventFormDialog: React.FC<TeamCalendarEventFormDialogProps> = ({
  open, setOpen, children
}) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button size="sm">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Event
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogDescription>
          Create a new calendar event for your team
        </DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
