
import React from "react";
import { MarketingContent } from "@/components/dashboard/MarketingContent";

interface DashboardMarketingSectionProps {
  viewAllUrl?: string;
}

export const DashboardMarketingSection: React.FC<DashboardMarketingSectionProps> = ({
  viewAllUrl
}) => {
  return (
    <div className="md:col-span-1">
      <MarketingContent clickable={true} viewAllUrl={viewAllUrl} />
    </div>
  );
};
