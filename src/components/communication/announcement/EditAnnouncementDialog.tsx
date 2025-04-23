
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Announcement, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeSelector } from "@/components/communication/EmployeeSelector";
import { AnnouncementAttachments } from "@/components/communication/AnnouncementAttachments";
import { Loader2 } from "lucide-react";

interface EditAnnouncementDialogProps {
  announcement: Announcement | null;
  allEmployees: User[];
  onClose: () => void;
  onSave: (announcement: Announcement) => void;
  loading?: boolean;
}

export const EditAnnouncementDialog: React.FC<EditAnnouncementDialogProps> = ({
  announcement,
  allEmployees,
  onClose,
  onSave,
  loading
}) => {
  const [editedAnnouncement, setEditedAnnouncement] = useState<Announcement | null>(announcement);
  const [attachments, setAttachments] = useState<File[]>([]);

  if (!announcement || !editedAnnouncement) return null;

  const handleSave = () => {
    if (editedAnnouncement) {
      onSave(editedAnnouncement);
    }
  };

  const handleContentChange = (field: keyof Announcement, value: any) => {
    setEditedAnnouncement(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

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
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    value={editedAnnouncement.title}
                    onChange={(e) => handleContentChange('title', e.target.value)}
                    placeholder="Announcement title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Content</label>
                  <Textarea
                    value={editedAnnouncement.content}
                    onChange={(e) => handleContentChange('content', e.target.value)}
                    placeholder="Announcement content"
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <Select
                    value={editedAnnouncement.priority}
                    onValueChange={(value: "urgent" | "important" | "fyi") => 
                      handleContentChange('priority', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="fyi">FYI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Target Type</label>
                  <Select
                    value={editedAnnouncement.target_type || 'all'}
                    onValueChange={(value: "all" | "specific") => 
                      handleContentChange('target_type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="specific">Specific Employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editedAnnouncement.target_type === 'specific' && (
                  <div>
                    <h3 className="font-medium mb-2">Recipients</h3>
                    <EmployeeSelector
                      selectedUserIds={editedAnnouncement.readBy || []}
                      setSelectedUserIds={(ids) => handleContentChange('readBy', ids)}
                      allEmployees={allEmployees}
                      loading={loading}
                    />
                  </div>
                )}

                <AnnouncementAttachments
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                  disabled={loading}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

