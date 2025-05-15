
import { useState } from "react";
import { LayoutItem } from "@/types/dashboard";
import { checkPositionOverlap, markPositionOccupied } from "./layoutUtils";
import { PositionMap } from "./layoutTypes";

interface UseLayoutGeneratorProps {
  widgetConfig: Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>;
  initialWidgetDefinitions: Record<string, { title: string; columnSpan: number }>;
  defaultHeights: Record<string, number>;
}

export function useLayoutGenerator({
  widgetConfig,
  initialWidgetDefinitions,
  defaultHeights
}: UseLayoutGeneratorProps) {
  const [currentLayout, setCurrentLayout] = useState<LayoutItem[]>(() => generateLayout());
  
  /**
   * Generate initial layout from widget config or defaults
   */
  function generateLayout(): LayoutItem[] {
    // Track occupied space to prevent overlaps
    const occupiedSpaces: PositionMap = {};
    
    // Start with an empty layout
    const layout: LayoutItem[] = [];
    
    // Get sorted widgets by vertical position
    const sortedWidgets = getSortedWidgets();
    
    // Process each widget
    sortedWidgets.forEach(({ id, widget }) => {
      const config = widgetConfig[id];
      const isVisible = config ? config.visible !== false : true;
      
      if (isVisible) {
        const dimensions = getWidgetDimensions(id, widget);
        placeWidgetInLayout(id, dimensions, layout, occupiedSpaces);
      }
    });
    
    return layout;
  }
  
  /**
   * Sort widgets by their y-position to maintain vertical ordering
   */
  function getSortedWidgets() {
    return Object.entries(initialWidgetDefinitions)
      .map(([id, widget]) => {
        const config = widgetConfig[id];
        const y = config?.y !== undefined ? config.y : 0;
        return { id, widget, y };
      })
      .sort((a, b) => a.y - b.y);
  }
  
  /**
   * Get dimensions for a widget based on config or defaults
   */
  function getWidgetDimensions(id: string, widget: { title: string; columnSpan: number }) {
    const config = widgetConfig[id];
    
    // Calculate width based on column span
    const colSpan = widget.columnSpan;
    const w = config?.w !== undefined ? config.w : Math.min(colSpan * 3, 12);
    
    // Get height from config or use default
    const h = config?.h !== undefined ? config.h : (defaultHeights[id] || 8);
    
    return { w, h };
  }
  
  /**
   * Place a widget in the layout in an appropriate position
   */
  function placeWidgetInLayout(
    id: string, 
    dimensions: { w: number, h: number }, 
    layout: LayoutItem[],
    occupiedSpaces: PositionMap
  ) {
    const { w, h } = dimensions;
    const config = widgetConfig[id];
    
    // Try to use saved position if available
    if (config?.x !== undefined && config?.y !== undefined) {
      const x = config.x;
      const y = config.y;
      
      // If the saved position is valid (no overlap), use it
      if (!checkPositionOverlap(x, y, w, h, occupiedSpaces)) {
        markPositionOccupied(x, y, w, h, occupiedSpaces);
        addWidgetToLayout(id, x, y, w, h, layout);
        return;
      }
      // If saved position would cause overlap, fall through to auto-placement
    }
    
    // Auto placement - find first available position
    findAndPlaceInAvailablePosition(id, w, h, layout, occupiedSpaces);
  }
  
  /**
   * Find an available position on the grid and place the widget there
   */
  function findAndPlaceInAvailablePosition(
    id: string, 
    w: number, 
    h: number, 
    layout: LayoutItem[],
    occupiedSpaces: PositionMap
  ) {
    // Try to place in the first available space
    for (let y = 0; y < 1000; y++) { // Limit to prevent infinite loop
      for (let x = 0; x <= 12 - w; x++) {
        // Check if this position is free
        if (!checkPositionOverlap(x, y, w, h, occupiedSpaces)) {
          markPositionOccupied(x, y, w, h, occupiedSpaces);
          addWidgetToLayout(id, x, y, w, h, layout);
          return;
        }
      }
    }
  }
  
  /**
   * Add a widget to the layout with the given parameters
   */
  function addWidgetToLayout(id: string, x: number, y: number, w: number, h: number, layout: LayoutItem[]) {
    layout.push({
      i: id,
      x,
      y,
      w,
      h,
      minW: 3,
      minH: 4,
      isDraggable: true,
      isResizable: true,
      isBounded: true
    });
  }

  return {
    currentLayout,
    setCurrentLayout,
    generateLayout
  };
}
