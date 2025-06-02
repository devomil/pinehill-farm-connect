
import React from "react";

interface DashboardCustomizationBannerProps {
  isCustomizing: boolean;
}

export const DashboardCustomizationBanner: React.FC<DashboardCustomizationBannerProps> = ({
  isCustomizing
}) => {
  if (!isCustomizing) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-700">
      <p className="text-sm">
        Customization mode active - drag widgets by their handles to rearrange, or resize them using the corner handles. 
        Click "Save Layout" when you're done.
      </p>
    </div>
  );
};
