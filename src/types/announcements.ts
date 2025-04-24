
export interface AnnouncementData {
  title: string;
  total_users: number;
  read_count: number;
  acknowledged_count: number | null;
  requires_acknowledgment: boolean;
  users: {
    id: string;
    name: string;
    avatar_url?: string;
    read: boolean;
    acknowledged: boolean;
    read_at?: string;
    acknowledged_at?: string;
  }[];
}
