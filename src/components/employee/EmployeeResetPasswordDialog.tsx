
import React from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { User as UserType } from "@/types";
import { toast } from "sonner";

interface EmployeeResetPasswordDialogProps {
  employee: UserType | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function EmployeeResetPasswordDialog({ employee, open, setOpen }: EmployeeResetPasswordDialogProps) {
  const [resetLoading, setResetLoading] = React.useState(false);

  const confirmResetPassword = async () => {
    if (!employee) return;
    setResetLoading(true);
    try {
      const res = await fetch("https://pdeaxfhsodenefeckabm.supabase.co/functions/v1/admin-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: employee.email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Password reset link sent to ${employee.email}.`);
      } else {
        toast.error(data.error || "Failed to send reset email.");
      }
    } catch (err) {
      toast.error("Failed to send reset email.");
    } finally {
      setResetLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Password?</AlertDialogTitle>
          <AlertDialogDescription>
            Send a password reset email to <b>{employee?.name}</b> ({employee?.email})? <br />
            This will allow the employee to set a new password.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={resetLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmResetPassword} disabled={resetLoading}>
            {resetLoading ? "Sending..." : "Send Reset Email"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
