
import { LayoutItem } from "@/types/dashboard";
import { LayoutConfig, PositionMap } from "./layoutTypes";

/**
 * Load saved widget configuration from localStorage
 */
export function getSavedWidgetConfig(): Record<string, LayoutConfig> {
  try {
    const saved = localStorage.getItem('dashboardWidgetConfig');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error("Failed to load dashboard config:", e);
    return {};
  }
}

/**
 * Check if a layout position would cause overlap with existing widgets
 */
export function checkPositionOverlap(
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  occupiedSpaces: PositionMap
): boolean {
  for (let i = x; i < x + w; i++) {
    for (let j = y; j < y + h; j++) {
      if (occupiedSpaces[`${i},${j}`]) {
        return true; // Found overlap
      }
    }
  }
  return false;
}

/**
 * Mark grid positions as occupied
 */
export function markPositionOccupied(
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  occupiedSpaces: PositionMap
): void {
  for (let i = x; i < x + w; i++) {
    for (let j = y; j < y + h; j++) {
      occupiedSpaces[`${i},${j}`] = true;
    }
  }
}

/**
 * Calculate the maximum Y position in the current layout
 */
export function getMaxYPosition(layout: LayoutItem[]): number {
  return layout.reduce((max, item) => 
    Math.max(max, item.y + item.h), 0);
}

/**
 * Find an available position for a new widget
 */
export function findAvailablePosition(
  w: number,
  h: number,
  occupiedSpaces: PositionMap
): { x: number, y: number } {
  let bestX = 0;
  let bestY = 0;
  let placed = false;
  
  // Try to place in the first available space
  for (let y = 0; y < 1000 && !placed; y++) {
    for (let x = 0; x <= 12 - w && !placed; x++) {
      if (!checkPositionOverlap(x, y, w, h, occupiedSpaces)) {
        bestX = x;
        bestY = y;
        placed = true;
        break;
      }
    }
    if (placed) break;
  }
  
  return { x: bestX, y: bestY };
}

/**
 * Check if the entire layout has valid positions without overlaps
 */
export function validateLayout(layout: LayoutItem[]): boolean {
  const gridPositions: PositionMap = {};
  
  for (const item of layout) {
    for (let x = item.x; x < item.x + item.w; x++) {
      for (let y = item.y; y < item.y + item.h; y++) {
        const key = `${x},${y}`;
        if (gridPositions[key]) {
          return false; // Found overlap
        }
        gridPositions[key] = true;
      }
    }
  }
  
  return true;
}

/**
 * Save widget sizes to localStorage
 */
export function saveWidgetSizes(widgetSizes: Record<string, { width: number, height: number }>): void {
  try {
    localStorage.setItem('dashboard-widget-sizes', JSON.stringify(widgetSizes));
  } catch (error) {
    console.error("Failed to save widget sizes:", error);
  }
}

/**
 * Load widget sizes from localStorage
 */
export function loadWidgetSizes(): Record<string, { width: number, height: number }> {
  try {
    const saved = localStorage.getItem('dashboard-widget-sizes');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Failed to load widget sizes:", error);
    return {};
  }
}

/**
 * Apply size constraints to widget dimensions
 */
export function applySizeConstraints(
  width: number,
  height: number,
  minWidth: number,
  minHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number, height: number } {
  let constrainedWidth = Math.max(width, minWidth);
  let constrainedHeight = Math.max(height, minHeight);
  
  if (maxWidth !== undefined) {
    constrainedWidth = Math.min(constrainedWidth, maxWidth);
  }
  
  if (maxHeight !== undefined) {
    constrainedHeight = Math.min(constrainedHeight, maxHeight);
  }
  
  return { width: constrainedWidth, height: constrainedHeight };
}
