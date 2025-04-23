
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Announcement, User } from "@/types";
import { Button } from "@/components/ui/button";
import { EmployeeSelector } from "@/components/communication/EmployeeSelector";
import { Loader2 } from "lucide-react";

interface EditAnnouncementDialogProps {
  announcement: Announcement | null;
  allEmployees: User[];
  onClose: () => void;
  onSave: () => void;
  loading?: boolean;
}

export const EditAnnouncementDialog: React.FC<EditAnnouncementDialogProps> = ({
  announcement,
  allEmployees,
  onClose,
  onSave,
  loading
}) => {
  if (!announcement) return null;

  return (
    <Dialog open={!!announcement} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
          <DialogDescription>
            Make changes to this announcement. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <>
              {/* Announcement edit form would go here */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Recipients</h3>
                  <EmployeeSelector
                    selectedUserIds={announcement.readBy || []}
                    setSelectedUserIds={(ids) => {
                      // This would be handled in the parent component
                      console.log("Selected users:", ids);
                    }}
                    allEmployees={allEmployees}
                    loading={loading}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={onSave}>Save Changes</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
