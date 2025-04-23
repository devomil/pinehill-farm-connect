import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmployeeSelector } from "./EmployeeSelector";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useAnnouncementForm } from "@/hooks/useAnnouncementForm";
import { AnnouncementAttachments } from "./AnnouncementAttachments";

interface AdminAnnouncementFormProps {
  allEmployees: User[];
  onCreate: () => void;
  closeDialog: () => void;
}

export const AdminAnnouncementForm: React.FC<AdminAnnouncementFormProps> = ({
  allEmployees,
  onCreate,
  closeDialog,
}) => {
  const { currentUser } = useAuth();
  const {
    title,
    setTitle,
    content,
    setContent,
    priority,
    setPriority,
    hasQuiz,
    setHasQuiz,
    targetType,
    setTargetType,
    selectedUserIds,
    setSelectedUserIds,
    attachments,
    setAttachments,
    requiresAcknowledgment,
    setRequiresAcknowledgment,
    loading,
    handleCreate
  } = useAnnouncementForm({
    allEmployees,
    onCreate,
    closeDialog,
    currentUser
  });

  return (
    <form className="space-y-4" onSubmit={handleCreate}>
      <Input 
        required 
        disabled={loading} 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        placeholder="Announcement Title" 
      />
      
      <Textarea 
        required 
        disabled={loading} 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        placeholder="Enter announcement details..." 
      />
      
      <div className="flex items-center gap-4">
        <div>
          <label className="block font-medium text-sm mb-1">Priority</label>
          <Select value={priority} onValueChange={v => setPriority(v as any)} disabled={loading}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="fyi">FYI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={hasQuiz} 
            disabled={loading} 
            onChange={e => setHasQuiz(e.target.checked)} 
            className="accent-primary" 
          />
          <span>Has Quiz</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={requiresAcknowledgment} 
            disabled={loading} 
            onChange={e => setRequiresAcknowledgment(e.target.checked)} 
            className="accent-primary" 
          />
          <span>Requires Acknowledgment</span>
        </label>
      </div>

      <div>
        <label className="block font-medium text-sm mb-1">Send to</label>
        <Select value={targetType} onValueChange={v => setTargetType(v as any)} disabled={loading}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Entire Company</SelectItem>
            <SelectItem value="specific">Specific Employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {targetType === "specific" && (
        <EmployeeSelector
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          allEmployees={allEmployees}
        />
      )}

      <AnnouncementAttachments
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        disabled={loading}
      />

      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
};
