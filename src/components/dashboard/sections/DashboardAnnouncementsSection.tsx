
import React from "react";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { AnnouncementStats } from "@/components/dashboard/AnnouncementStats";
import { AnnouncementsEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";

interface DashboardAnnouncementsSectionProps {
  announcements: any[] | null;
  isAdmin: boolean;
  viewAllUrl?: string;
}

export const DashboardAnnouncementsSection: React.FC<DashboardAnnouncementsSectionProps> = ({
  announcements,
  isAdmin,
  viewAllUrl,
}) => {
  const navigate = useNavigate();
  
  const handleCreateAnnouncement = () => {
    navigate("/communication?tab=announcements&action=new");
  };
  
  const hasAnnouncements = announcements && announcements.length > 0;
  
  return (
    <>
      <div className="md:col-span-2">
        {hasAnnouncements ? (
          <AnnouncementsCard 
            announcements={announcements || []} 
            clickable={true} 
            viewAllUrl={viewAllUrl}
          />
        ) : (
          <AnnouncementsEmptyState 
            isAdmin={isAdmin} 
            onCreateAnnouncement={isAdmin ? handleCreateAnnouncement : undefined} 
          />
        )}
      </div>
      {isAdmin && hasAnnouncements && (
        <div className="md:col-span-2">
          <AnnouncementStats clickable={true} viewAllUrl={viewAllUrl} />
        </div>
      )}
    </>
  );
};
