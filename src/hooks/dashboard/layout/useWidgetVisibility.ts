
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getMaxYPosition, findAvailablePosition, markPositionOccupied } from "./layoutUtils";
import { LayoutItem } from "@/types/dashboard";

interface UseWidgetVisibilityProps {
  widgetConfig: Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>;
  setWidgetConfig: React.Dispatch<React.SetStateAction<Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>>>;
  currentLayout: LayoutItem[];
  setCurrentLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
  initialWidgetDefinitions: Record<string, { title: string; columnSpan: number }>;
  defaultHeights: Record<string, number>;
  setHasLayoutChanged: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useWidgetVisibility({
  widgetConfig,
  setWidgetConfig,
  currentLayout,
  setCurrentLayout,
  initialWidgetDefinitions,
  defaultHeights,
  setHasLayoutChanged
}: UseWidgetVisibilityProps) {
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  
  // Update hidden widgets list
  useEffect(() => {
    const hidden = Object.entries(widgetConfig)
      .filter(([_, config]) => !config.visible)
      .map(([id]) => id);
    setHiddenWidgets(hidden);
  }, [widgetConfig]);

  // Toggle widget visibility
  const toggleWidgetVisibility = (id: string) => {
    if (widgetConfig[id]?.visible === false) {
      // Show the widget
      const newWidgetConfig = { ...widgetConfig };
      newWidgetConfig[id] = { 
        ...newWidgetConfig[id],
        visible: true 
      };
      setWidgetConfig(newWidgetConfig);
      
      // Add it to the layout
      // Find empty space in the grid
      const occupiedSpaces: Record<string, boolean> = {};
      
      // Mark all occupied spaces from current layout
      currentLayout.forEach(item => {
        markPositionOccupied(item.x, item.y, item.w, item.h, occupiedSpaces);
      });
      
      // Find maximum Y position currently occupied
      const maxY = getMaxYPosition(currentLayout);
      
      // Prepare the new widget
      const w = initialWidgetDefinitions[id].columnSpan * 3;
      const h = defaultHeights[id] || 8;
      
      // Find position for new widget
      const { x: bestX, y: bestY } = findAvailablePosition(w, h, occupiedSpaces);
      
      const newItem: LayoutItem = {
        i: id,
        x: bestX,
        y: maxY > 0 ? maxY : bestY,
        w,
        h,
        minW: 3,
        minH: 4,
        isDraggable: true,
        isResizable: true,
        isBounded: true
      };
      
      setCurrentLayout([...currentLayout, newItem]);
      toast.success(`Added ${initialWidgetDefinitions[id].title} to dashboard`);
    } else {
      // Hide the widget
      const newWidgetConfig = { ...widgetConfig };
      const currentWidgetConfig = newWidgetConfig[id] || { 
        visible: true,
        x: 0,
        y: 0,
        w: initialWidgetDefinitions[id].columnSpan * 3,
        h: defaultHeights[id] || 8
      };
      
      // Store position before hiding
      newWidgetConfig[id] = { 
        ...currentWidgetConfig,
        visible: false 
      };
      
      setWidgetConfig(newWidgetConfig);
      setCurrentLayout(currentLayout.filter(item => item.i !== id));
      toast.success(`Removed ${initialWidgetDefinitions[id].title} from dashboard`);
    }
    
    setHasLayoutChanged(true);
  };

  return {
    hiddenWidgets,
    toggleWidgetVisibility
  };
}
