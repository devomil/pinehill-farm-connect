
import React from "react";
import { MarketingContent } from "@/components/dashboard/MarketingContent";

interface DashboardMarketingSectionProps {
  viewAllUrl?: string;
  className?: string;
}

export const DashboardMarketingSection: React.FC<DashboardMarketingSectionProps> = ({
  viewAllUrl,
  className
}) => {
  return (
    <div className="h-full">
      <MarketingContent 
        clickable={true} 
        viewAllUrl={viewAllUrl} 
        className={className}
      />
    </div>
  );
};
