
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X } from "lucide-react";

interface ShiftResponseConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isAccepting: boolean;
  requesterName: string;
  shiftDate: string;
  shiftTime: string;
}

export const ShiftResponseConfirmDialog: React.FC<ShiftResponseConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isAccepting,
  requesterName,
  shiftDate,
  shiftTime
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isAccepting ? "Accept Shift Coverage Request?" : "Decline Shift Coverage Request?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isAccepting ? (
              <>
                You are about to <strong className="text-green-600">accept</strong> the shift coverage request from <strong>{requesterName}</strong> for <strong>{shiftDate}</strong> ({shiftTime}).
                <br /><br />
                By accepting, you are committing to cover this shift.
              </>
            ) : (
              <>
                You are about to <strong className="text-red-600">decline</strong> the shift coverage request from <strong>{requesterName}</strong> for <strong>{shiftDate}</strong> ({shiftTime}).
                <br /><br />
                The requester will be notified that you've declined this shift.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isAccepting ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isAccepting ? (
              <><Check className="mr-2 h-4 w-4" /> Confirm Accept</>
            ) : (
              <><X className="mr-2 h-4 w-4" /> Confirm Decline</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
