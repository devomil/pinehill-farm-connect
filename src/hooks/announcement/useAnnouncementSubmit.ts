
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Announcement } from "@/types";
import { validateUuid } from "@/utils/validators";

interface UseAnnouncementSubmitProps {
  currentUser: User | null;
  onCreate: (formData: any) => void; // Updated to accept formData
  closeDialog: () => void;
  initialData?: Announcement;
}

export const useAnnouncementSubmit = ({
  currentUser,
  onCreate,
  closeDialog,
  initialData
}: UseAnnouncementSubmitProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (
    announcementData: {
      title: string;
      content: string;
      priority: "urgent" | "important" | "fyi";
      hasQuiz: boolean;
      targetType: "all" | "specific";
      attachments: { name: string; size: number; type: string }[];
      requiresAcknowledgment: boolean;
    },
    selectedUserIds: string[],
    allEmployees: User[],
    files?: File[]
  ) => {
    setLoading(true);

    try {
      if (!currentUser || !currentUser.id) {
        toast({
          description: "You need to be logged in to create announcements.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!validateUuid(currentUser.id)) {
        toast({
          description: "Your user ID is not in the correct format. Please contact an administrator.",
          variant: "destructive"
        });
        return false;
      }

      // Upload files to storage if provided
      let processedAttachments = [...announcementData.attachments];
      
      if (files && files.length > 0) {
        console.log("Uploading files to storage:", files);
        
        for (const file of files) {
          try {
            const { error: uploadError } = await supabase
              .storage
              .from('announcements')
              .upload(`${file.name}`, file, {
                cacheControl: '3600',
                upsert: true
              });

            if (uploadError) {
              console.error("Error uploading file:", uploadError);
              toast({
                description: `Could not upload ${file.name}: ${uploadError.message}`,
                variant: "destructive"
              });
            } else {
              console.log(`Successfully uploaded ${file.name}`);
            }
          } catch (err) {
            console.error("Unexpected error during file upload:", err);
          }
        }
      }

      const dbAnnouncementData = {
        title: announcementData.title,
        content: announcementData.content,
        author_id: currentUser.id,
        priority: announcementData.priority,
        has_quiz: announcementData.hasQuiz,
        target_type: announcementData.targetType,
        attachments: processedAttachments,
        requires_acknowledgment: announcementData.requiresAcknowledgment
      };

      let error;
      let announcementId = initialData?.id;
      
      if (initialData) {
        const { error: updateError } = await supabase
          .from("announcements")
          .update(dbAnnouncementData)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { data: newAnnouncement, error: insertError } = await supabase
          .from("announcements")
          .insert(dbAnnouncementData)
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
          description: `Failed to ${initialData ? 'update' : 'create'} announcement: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      let recipientIds: string[];
      if (announcementData.targetType === "all") {
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
              description: "Announcement created, but there was an error assigning recipients: " + recipErr.message,
              variant: "default"
            });
            return true;
          }
        }
      }
      
      toast({ 
        description: initialData ? "Announcement updated!" : "Announcement created!" 
      });
      return true;
    } catch (e: any) {
      console.error("Unexpected error:", e);
      toast({ 
        description: e.message || String(e), 
        variant: "destructive" 
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit
  };
};
