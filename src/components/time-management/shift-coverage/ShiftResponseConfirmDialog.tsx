
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
  shiftTime,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isAccepting ? "Accept" : "Decline"} Shift Coverage Request
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isAccepting
              ? `Are you sure you want to accept ${requesterName}'s request to cover their shift on ${shiftDate} from ${shiftTime}?`
              : `Are you sure you want to decline ${requesterName}'s request to cover their shift on ${shiftDate} from ${shiftTime}?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isAccepting ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isAccepting ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Accept
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" /> Decline
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
