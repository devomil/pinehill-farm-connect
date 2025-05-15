
import { useState } from "react";
import { UseDashboardLayoutProps, UseDashboardLayoutResult } from "./layout/layoutTypes";
import { getSavedWidgetConfig } from "./layout/layoutUtils";
import { useLayoutGenerator } from "./layout/useLayoutGenerator";
import { useWidgetVisibility } from "./layout/useWidgetVisibility";
import { useLayoutOperations } from "./layout/useLayoutOperations";

/**
 * Custom hook to manage dashboard layout and widget configuration
 */
export function useDashboardLayout(
  initialWidgetDefinitions: Record<string, { title: string; columnSpan: number }>,
  defaultHeights: Record<string, number>
): UseDashboardLayoutResult {
  // Get saved widget configuration from localStorage if available
  const [widgetConfig, setWidgetConfig] = useState<Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>>(
    () => getSavedWidgetConfig()
  );
  
  // Use the layout generator hook
  const { 
    currentLayout, 
    setCurrentLayout, 
    generateLayout 
  } = useLayoutGenerator({
    widgetConfig,
    initialWidgetDefinitions,
    defaultHeights
  });
  
  // Use the layout operations hook
  const {
    isCustomizing,
    setIsCustomizing,
    showHiddenDialog,
    setShowHiddenDialog,
    hasLayoutChanged,
    setHasLayoutChanged,
    saveLayout,
    handleLayoutChange,
    resetLayout,
    toggleCustomizationMode,
    cancelCustomization
  } = useLayoutOperations({
    widgetConfig,
    setWidgetConfig,
    currentLayout,
    setCurrentLayout,
    generateLayout
  });
  
  // Use the widget visibility hook
  const { 
    hiddenWidgets,
    toggleWidgetVisibility 
  } = useWidgetVisibility({
    widgetConfig,
    setWidgetConfig,
    currentLayout,
    setCurrentLayout,
    initialWidgetDefinitions,
    defaultHeights,
    setHasLayoutChanged
  });

  return {
    isCustomizing,
    setIsCustomizing,
    showHiddenDialog,
    setShowHiddenDialog,
    hasLayoutChanged,
    widgetConfig,
    currentLayout,
    hiddenWidgets,
    saveLayout,
    handleLayoutChange,
    toggleWidgetVisibility,
    resetLayout,
    toggleCustomizationMode,
    cancelCustomization
  };
}
