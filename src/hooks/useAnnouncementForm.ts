
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Announcement } from "@/types";

interface UseAnnouncementFormProps {
  allEmployees: User[];
  onCreate: () => void;
  closeDialog: () => void;
  currentUser: User | null;
  initialData?: Announcement;
}

export const useAnnouncementForm = ({
  allEmployees,
  onCreate,
  closeDialog,
  currentUser,
  initialData
}: UseAnnouncementFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [priority, setPriority] = useState<"urgent" | "important" | "fyi">(initialData?.priority as any || "fyi");
  const [hasQuiz, setHasQuiz] = useState(initialData?.hasQuiz || false);
  const [targetType, setTargetType] = useState<"all"|"specific">(initialData?.target_type || "all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [requiresAcknowledgment, setRequiresAcknowledgment] = useState(initialData?.requires_acknowledgment || false);
  const { toast } = useToast();

  const validateUuid = (id: string): boolean => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(id);
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
      
      if (!currentUser || !currentUser.id) {
        toast({ title: "Authentication error", description: "You need to be logged in to create announcements.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      if (!validateUuid(currentUser.id)) {
        toast({ 
          title: "Invalid user ID format", 
          description: "Your user ID is not in the correct format. Please contact an administrator.", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }
      
      const attachmentsData = attachments.map(f => ({ name: f.name, size: f.size, type: f.type }));
      
      const announcementData = {
        title,
        content,
        author_id: currentUser?.id,
        priority,
        has_quiz: hasQuiz,
        target_type: targetType,
        attachments: attachmentsData,
        requires_acknowledgment: requiresAcknowledgment
      };

      let error;
      let announcementId = initialData?.id;
      
      if (initialData) {
        const { error: updateError } = await supabase
          .from("announcements")
          .update(announcementData)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { data: newAnnouncement, error: insertError } = await supabase
          .from("announcements")
          .insert(announcementData)
          .select()
          .single();
        
        if (newAnnouncement) {
          announcementId = newAnnouncement.id;
        }
        
        error = insertError;
      }
        
      if (error) {
        console.error("Announcement error:", error);
        toast({ 
          title: `Failed to ${initialData ? 'update' : 'create'} announcement`, 
          description: error.message, 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      let recipientIds: string[];
      if (targetType === "all") {
        recipientIds = allEmployees.map(u => u.id);
      } else {
        recipientIds = selectedUserIds;
      }
      
      if (recipientIds.length && announcementId) {
        const validRecipientIds = recipientIds.filter(id => validateUuid(id));
        
        if (validRecipientIds.length !== recipientIds.length) {
          console.warn(`Some recipient IDs were invalid and were filtered out: ${recipientIds.filter(id => !validateUuid(id))}`);
        }
        
        if (validRecipientIds.length === 0) {
          toast({ 
            title: "Warning", 
            description: "No valid recipients found. The announcement was created but no recipients were assigned.", 
            variant: "default" 
          });
        } else {
          const recipientsRows = validRecipientIds.map(user_id => ({ 
            announcement_id: announcementId, 
            user_id 
          }));
          
          const { error: recipErr } = await supabase
            .from("announcement_recipients")
            .insert(recipientsRows);
            
          if (recipErr) {
            console.error("Recipients assignment error:", recipErr);
            toast({ 
              title: "Announcement created", 
              description: "But there was an error assigning recipients: " + recipErr.message,
              variant: "default" 
            });
            setLoading(false);
            closeDialog();
            setTimeout(() => onCreate(), 500);
            return;
          }
        }
      }
      
      toast({ title: initialData ? "Announcement updated!" : "Announcement created!" });
      closeDialog();
      setTimeout(() => {
        onCreate();
      }, 500);
      
      resetForm();
    } catch (e: any) {
      console.error("Unexpected error:", e);
      toast({ title: "Unexpected error", description: e.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPriority("fyi");
    setHasQuiz(false);
    setTargetType("all");
    setSelectedUserIds([]);
    setAttachments([]);
  };

  return {
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
    loading,
    handleCreate,
    requiresAcknowledgment,
    setRequiresAcknowledgment
  };
};
