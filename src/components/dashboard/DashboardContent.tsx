
import React from "react";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { WidgetManagerDialog } from "@/components/dashboard/WidgetManagerDialog";
import { DashboardCustomizationBanner } from "./DashboardCustomizationBanner";
import { DashboardHiddenWidgetsIndicator } from "./DashboardHiddenWidgetsIndicator";
import { useDashboardContentLogic } from "@/hooks/dashboard/useDashboardContentLogic";
import { DashboardContentProps } from "./types/dashboardTypes";

export const DashboardContent: React.FC<DashboardContentProps> = (props) => {
  const {
    isCustomizing,
    showHiddenDialog,
    setShowHiddenDialog,
    hasLayoutChanged,
    currentLayout,
    hiddenWidgets,
    handleLayoutChange,
    toggleWidgetVisibility,
    resetLayout,
    toggleCustomizationMode,
    cancelCustomization,
    saveLayout,
    widgetComponents,
    gridConfig,
    dragHandleClass,
    initialWidgetDefinitions
  } = useDashboardContentLogic(props);

  return (
    <div className="space-y-6">
      <DashboardControls
        isCustomizing={isCustomizing}
        hasLayoutChanged={hasLayoutChanged}
        onToggleCustomization={toggleCustomizationMode}
        onCancel={cancelCustomization}
        onReset={resetLayout}
        onSave={saveLayout}
        onOpenWidgetManager={() => setShowHiddenDialog(true)}
      />
      
      <DashboardCustomizationBanner isCustomizing={isCustomizing} />
      
      <DashboardGrid
        isCustomizing={isCustomizing}
        layout={currentLayout}
        widgets={widgetComponents}
        onLayoutChange={handleLayoutChange}
        onRemoveWidget={toggleWidgetVisibility}
        breakpoints={gridConfig.breakpoints}
        cols={gridConfig.cols}
        dragHandleClass={dragHandleClass}
      />
      
      <WidgetManagerDialog
        open={showHiddenDialog}
        onOpenChange={setShowHiddenDialog}
        currentLayout={currentLayout}
        hiddenWidgets={hiddenWidgets}
        toggleWidgetVisibility={toggleWidgetVisibility}
        widgetDefinitions={initialWidgetDefinitions}
      />
      
      <DashboardHiddenWidgetsIndicator
        hiddenWidgets={hiddenWidgets}
        isCustomizing={isCustomizing}
        onOpenWidgetManager={() => setShowHiddenDialog(true)}
      />
    </div>
  );
};
