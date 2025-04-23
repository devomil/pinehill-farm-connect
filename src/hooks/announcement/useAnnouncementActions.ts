
import { Announcement } from "@/types";
import { useAnnouncementEdit } from "./useAnnouncementEdit";
import { useAnnouncementDelete } from "./useAnnouncementDelete";

export const useAnnouncementActions = () => {
  const { handleEdit } = useAnnouncementEdit();
  const { handleDelete } = useAnnouncementDelete();

  return {
    handleEdit,
    handleDelete
  };
};
