
import React from "react";

interface DashboardHiddenWidgetsIndicatorProps {
  hiddenWidgets: any[];
  isCustomizing: boolean;
  onOpenWidgetManager: () => void;
}

export const DashboardHiddenWidgetsIndicator: React.FC<DashboardHiddenWidgetsIndicatorProps> = ({
  hiddenWidgets,
  isCustomizing,
  onOpenWidgetManager
}) => {
  if (hiddenWidgets.length === 0 || isCustomizing) return null;

  return (
    <button 
      onClick={onOpenWidgetManager}
      className="flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
    >
      {hiddenWidgets.length} hidden widget{hiddenWidgets.length !== 1 ? 's' : ''} - click to manage
    </button>
  );
};
