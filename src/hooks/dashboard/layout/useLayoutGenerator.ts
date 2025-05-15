
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
    
    // Sort widgets by saved y position to maintain vertical ordering
    const sortedWidgets = Object.entries(initialWidgetDefinitions)
      .map(([id, widget]) => {
        const config = widgetConfig[id];
        const y = config?.y !== undefined ? config.y : 0;
        return { id, widget, y };
      })
      .sort((a, b) => a.y - b.y);
    
    // Process each widget
    sortedWidgets.forEach(({ id, widget }) => {
      const config = widgetConfig[id];
      const isVisible = config ? config.visible !== false : true;
      
      if (isVisible) {
        // Calculate width based on column span
        const colSpan = widget.columnSpan;
        const w = config?.w !== undefined ? config.w : Math.min(colSpan * 3, 12);
        
        // Get height from config or use default
        const h = config?.h !== undefined ? config.h : (defaultHeights[id] || 8);
        
        // If we have a saved position, try to use it
        if (config?.x !== undefined && config?.y !== undefined) {
          // Check if the position would cause overlap
          let validPosition = true;
          const x = config.x;
          const y = config.y;
          
          // Check if this position would cause overlap
          if (!checkPositionOverlap(x, y, w, h, occupiedSpaces)) {
            // Mark this space as occupied
            markPositionOccupied(x, y, w, h, occupiedSpaces);
            
            // Add to layout
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
            
            return;
          }
          // If position would cause overlap, fall through to auto-placement
        }
        
        // Auto placement logic - find first available space
        let placed = false;
        
        // Try to place in the first available row
        for (let y = 0; y < 1000 && !placed; y++) { // Limit to prevent infinite loop
          for (let x = 0; x <= 12 - w && !placed; x++) {
            // Check if this position is free
            if (!checkPositionOverlap(x, y, w, h, occupiedSpaces)) {
              // Mark this space as occupied
              markPositionOccupied(x, y, w, h, occupiedSpaces);
              
              // Add to layout
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
              
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
      }
    });
    
    return layout;
  }

  return {
    currentLayout,
    setCurrentLayout,
    generateLayout
  };
}
