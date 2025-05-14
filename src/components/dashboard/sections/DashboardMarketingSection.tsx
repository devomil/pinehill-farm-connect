
import React from "react";
import { MarketingContent } from "@/components/dashboard/MarketingContent";

export const DashboardMarketingSection: React.FC = () => {
  return (
    <div className="md:col-span-2">
      <MarketingContent viewAllUrl="/marketing" onViewAllClick={() => {}} />
    </div>
  );
};
