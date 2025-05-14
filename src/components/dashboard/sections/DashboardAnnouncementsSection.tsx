
import React from "react";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { AnnouncementStats } from "@/components/dashboard/AnnouncementStats";

interface DashboardAnnouncementsSectionProps {
  announcements: any[] | null;
  isAdmin: boolean;
}

export const DashboardAnnouncementsSection: React.FC<DashboardAnnouncementsSectionProps> = ({
  announcements,
  isAdmin,
}) => {
  if (!announcements || announcements.length === 0) return null;
  
  return (
    <>
      <div className="md:col-span-2">
        <AnnouncementsCard announcements={announcements} clickable={true} viewAllUrl="/communication?tab=announcements" />
      </div>
      {isAdmin && (
        <div className="md:col-span-2">
          <AnnouncementStats clickable={true} viewAllUrl="/communication?tab=announcements" />
        </div>
      )}
    </>
  );
};
