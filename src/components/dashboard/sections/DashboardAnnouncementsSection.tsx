
import React from "react";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { AnnouncementStats } from "@/components/dashboard/AnnouncementStats";

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
  if (!announcements || announcements.length === 0) return null;
  
  return (
    <>
      <div className="md:col-span-2">
        <AnnouncementsCard announcements={announcements} clickable={true} viewAllUrl={viewAllUrl} />
      </div>
      {isAdmin && (
        <div className="md:col-span-2">
          <AnnouncementStats clickable={true} viewAllUrl={viewAllUrl} />
        </div>
      )}
    </>
  );
};
