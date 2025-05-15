
import React from "react";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { AnnouncementStats } from "@/components/dashboard/AnnouncementStats";
import { AnnouncementsEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

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
  
  // Save resize state to localStorage
  const handleResize = (sizes: number[]) => {
    localStorage.setItem('dashboard-announcements-sizes', JSON.stringify(sizes));
  };
  
  // Get saved sizes from localStorage or use defaults
  const getSavedSizes = (): number[] => {
    try {
      const saved = localStorage.getItem('dashboard-announcements-sizes');
      return saved ? JSON.parse(saved) : [60, 40];
    } catch (e) {
      console.error("Failed to parse saved sizes:", e);
      return [60, 40];
    }
  };
  
  return (
    <>
      {hasAnnouncements && isAdmin ? (
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={handleResize}
          className="h-full rounded-lg overflow-hidden"
        >
          <ResizablePanel defaultSize={getSavedSizes()[0]} minSize={40}>
            <AnnouncementsCard 
              announcements={announcements || []} 
              clickable={true} 
              viewAllUrl={viewAllUrl}
            />
          </ResizablePanel>
          <ResizablePanel defaultSize={getSavedSizes()[1]} minSize={30}>
            <AnnouncementStats clickable={true} viewAllUrl={viewAllUrl} />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
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
      )}
    </>
  );
};
