
interface CommunicationHeaderProps {
  isAdmin: boolean;
  allEmployees: User[];
  onAnnouncementCreate: () => void;
  loading?: boolean;
}
