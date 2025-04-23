
import { useState } from "react";
import { User, Announcement } from "@/types";
import { useAnnouncementSubmit } from "./useAnnouncementSubmit";

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
  const [requiresAcknowledgment, setRequiresAcknowledgment] = useState(initialData?.requires_acknowledgment || false);

  const { loading, handleSubmit } = useAnnouncementSubmit({
    currentUser,
    onCreate,
    closeDialog,
    initialData
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await handleSubmit(
      {
        title,
        content,
        priority,
        hasQuiz,
        targetType,
        attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type })),
        requiresAcknowledgment
      },
      selectedUserIds,
      allEmployees
    );

    if (success) {
      closeDialog();
      setTimeout(() => {
        onCreate();
      }, 500);
      resetForm();
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
