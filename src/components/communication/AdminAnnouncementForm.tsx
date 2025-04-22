
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmployeeSelector } from "./EmployeeSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Paperclip, Loader2 } from "lucide-react";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { User } from "@/types";

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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"urgent" | "important" | "fyi">("fyi");
  const [hasQuiz, setHasQuiz] = useState(false);
  const [targetType, setTargetType] = useState<"all"|"specific">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // How files are "uploaded": for now store file names and fake download links (real storage would use supabase storage)
  const handleAttachments = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files;
    if (files) {
      setAttachments([...attachments, ...Array.from(files)]);
    }
  };

  const removeAttachment = (i: number) => {
    setAttachments(attachments.filter((_, idx) => idx !== i));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!title.trim() || !content.trim()) {
        toast({ title: "Title and content required", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (targetType === "specific" && selectedUserIds.length === 0) {
        toast({ title: "No recipients selected", description: "Select at least one employee.", variant: "destructive" });
        setLoading(false);
        return;
      }
      // "Upload" files: for MVP store names only. TODO: implement storage later.
      const attachmentsData = attachments.map(f => ({ name: f.name, size: f.size, type: f.type }));
      // Insert announcement
      const { data: announcement, error } = await supabase
        .from("announcements")
        .insert({
          title,
          content,
          author_id: "", // TODO: have the backend derive this from auth.uid()
          priority,
          has_quiz: hasQuiz,
          target_type: targetType,
          attachments: attachmentsData,
        })
        .select()
        .single();
      if (error) {
        toast({ title: "Failed to create announcement", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      // Attach recipients
      let recipientIds: string[];
      if (targetType === "all") {
        recipientIds = allEmployees.map(u => u.id);
      } else {
        recipientIds = selectedUserIds;
      }
      if (recipientIds.length) {
        const recipientsRows = recipientIds.map(user_id => ({ announcement_id: announcement.id, user_id }));
        const { error: recipErr } = await supabase.from("announcement_recipients").insert(recipientsRows);
        if (recipErr) {
          toast({ title: "Failed to assign recipients", description: recipErr.message, variant: "destructive" });
          setLoading(false);
          return;
        }
      }
      toast({ title: "Announcement created!" });
      closeDialog();
      setTimeout(() => {
        onCreate();
      }, 500);
      // Reset form
      setTitle(""); setContent(""); setPriority("fyi"); setHasQuiz(false); setTargetType("all"); setSelectedUserIds([]); setAttachments([]);
    } catch (e: any) {
      toast({ title: "Unexpected error", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleCreate}>
      <Input required disabled={loading} value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement Title" />
      <Textarea required disabled={loading} value={content} onChange={e => setContent(e.target.value)} placeholder="Enter announcement details..." />
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
          <input type="checkbox" checked={hasQuiz} disabled={loading} onChange={e => setHasQuiz(e.target.checked)} className="accent-primary" />
          <span>Has Quiz</span>
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
      <div>
        <label className="font-medium text-sm">Attachments</label>
        <label className="block mt-1 mb-2">
          <Button asChild size="sm" variant="outline">
            <span>
              <Paperclip className="h-4 w-4 mr-1 inline" /> Add Attachment
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleAttachments}
                disabled={loading}
              />
            </span>
          </Button>
        </label>
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, idx) => (
            <div key={idx} className="flex items-center bg-muted px-2 py-1 rounded text-xs">
              <span>{file.name}</span>
              <Button type="button" size="icon" variant="ghost" className="ml-1 px-1"
                onClick={() => removeAttachment(idx)}
                disabled={loading}
              >✕</Button>
            </div>
          ))}
        </div>
      </div>
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
}
