
import { DashboardContentProps } from "@/components/dashboard/types/dashboardTypes";
import { useDashboardWidgets } from "./useDashboardWidgets";
import { useDashboardLayout } from "./useDashboardLayout";

export const useDashboardContentLogic = (props: DashboardContentProps) => {
  // Get widget definitions and configurations
  const { 
    defaultHeights, 
    initialWidgetDefinitions, 
    widgetComponents,
    gridConfig
  } = useDashboardWidgets(props);

  // Use the dashboard layout hook to manage layout state
  const layoutManager = useDashboardLayout(initialWidgetDefinitions, defaultHeights);

  // Draggable handle class for grid layout
  const dragHandleClass = "drag-handle";

  return {
    ...layoutManager,
    widgetComponents,
    gridConfig,
    dragHandleClass,
    initialWidgetDefinitions
  };
};
