
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { User } from "@/types";
import { ShiftCoverageDialog } from "./shift-coverage/ShiftCoverageDialog";

type NewShiftCoverageRequestButtonProps = {
  currentUser: User;
  allEmployees: User[];
  onRequestSent: () => void;
};

export function NewShiftCoverageRequestButton({
  currentUser,
  allEmployees,
  onRequestSent
}: NewShiftCoverageRequestButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} variant="default">
        <CalendarPlus className="h-4 w-4 mr-2" /> Request Coverage
      </Button>

      <ShiftCoverageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentUser={currentUser}
        allEmployees={allEmployees || []}
        onRequestSent={onRequestSent}
      />
    </>
  );
}
