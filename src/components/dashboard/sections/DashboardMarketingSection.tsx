
import React from "react";
import { MarketingContent } from "@/components/dashboard/MarketingContent";
import { MarketingEmptyState } from "../empty-states";
import { useNavigate } from "react-router-dom";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface DashboardMarketingSectionProps {
  viewAllUrl?: string;
  className?: string;
  isAdmin?: boolean;
}

export const DashboardMarketingSection: React.FC<DashboardMarketingSectionProps> = ({
  viewAllUrl,
  className,
  isAdmin = false
}) => {
  const navigate = useNavigate();
  
  const handleAddContent = () => {
    navigate("/marketing?action=upload");
  };

  // Check if there is marketing content (this would need to be properly implemented)
  const hasContent = true; // This is a placeholder - you would typically check if there is content

  // Save resize state to localStorage
  const handleResize = (sizes: number[]) => {
    localStorage.setItem('dashboard-marketing-size', sizes[0].toString());
  };

  // Get saved size from localStorage or use default
  const defaultSize = parseInt(localStorage.getItem('dashboard-marketing-size') || '100');

  return (
    <ResizablePanelGroup 
      direction="horizontal"
      onLayout={handleResize}
      className="h-full rounded-lg overflow-hidden"
    >
      <ResizablePanel 
        defaultSize={defaultSize}
        className="h-full rounded-lg overflow-hidden" 
        minSize={30}
        maxSize={100}
      >
        {hasContent ? (
          <MarketingContent 
            clickable={true} 
            viewAllUrl={viewAllUrl} 
            className={className}
          />
        ) : (
          <MarketingEmptyState 
            isAdmin={isAdmin} 
            onAddContent={isAdmin ? handleAddContent : undefined} 
          />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
