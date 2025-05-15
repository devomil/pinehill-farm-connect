
import React from "react";
import { DashboardControls } from "@/components/dashboard/DashboardControls";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { WidgetManagerDialog } from "@/components/dashboard/WidgetManagerDialog";
import { useDashboardWidgets } from "@/hooks/dashboard/useDashboardWidgets";
import { useDashboardLayout } from "@/hooks/dashboard/useDashboardLayout";
import { DashboardContentProps } from "./types/dashboardTypes";

export const DashboardContent: React.FC<DashboardContentProps> = (props) => {
  // Get widget definitions and configurations
  const { 
    defaultHeights, 
    initialWidgetDefinitions, 
    widgetComponents,
    gridConfig
  } = useDashboardWidgets(props);

  // Use the dashboard layout hook to manage layout state
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
    saveLayout
  } = useDashboardLayout(initialWidgetDefinitions, defaultHeights);

  // Draggable handle class for grid layout
  const dragHandleClass = "drag-handle";

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <DashboardControls
        isCustomizing={isCustomizing}
        hasLayoutChanged={hasLayoutChanged}
        onToggleCustomization={toggleCustomizationMode}
        onCancel={cancelCustomization}
        onReset={resetLayout}
        onSave={saveLayout}
        onOpenWidgetManager={() => setShowHiddenDialog(true)}
      />
      
      {isCustomizing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-700">
          <p className="text-sm">
            Customization mode active - drag widgets by their handles to rearrange, or resize them using the corner handles. 
            Click "Save Layout" when you're done.
          </p>
        </div>
      )}
      
      {/* Dashboard Grid */}
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
      
      {/* Widget Manager Dialog */}
      <WidgetManagerDialog
        open={showHiddenDialog}
        onOpenChange={setShowHiddenDialog}
        currentLayout={currentLayout}
        hiddenWidgets={hiddenWidgets}
        toggleWidgetVisibility={toggleWidgetVisibility}
        widgetDefinitions={initialWidgetDefinitions}
      />
      
      {/* Hidden Widgets Indicator */}
      {hiddenWidgets.length > 0 && !isCustomizing && (
        <button 
          onClick={() => setShowHiddenDialog(true)}
          className="flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          {hiddenWidgets.length} hidden widget{hiddenWidgets.length !== 1 ? 's' : ''} - click to manage
        </button>
      )}
    </div>
  );
};
