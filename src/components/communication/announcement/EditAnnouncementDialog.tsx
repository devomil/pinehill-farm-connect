
interface EditAnnouncementDialogProps {
  announcement: Announcement | null;
  allEmployees: User[];
  onClose: () => void;
  onSave: () => void;
  loading?: boolean;
}
