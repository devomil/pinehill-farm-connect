
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { LayoutItem } from "@/types/dashboard";
import { DashboardLayoutHookResult } from "@/components/dashboard/types/dashboardTypes";

/**
 * Custom hook to manage dashboard layout and widget configuration
 */
export function useDashboardLayout(
  initialWidgetDefinitions: Record<string, { title: string; columnSpan: number }>,
  defaultHeights: Record<string, number>
): DashboardLayoutHookResult {
  // Get saved widget configuration from localStorage if available
  const getSavedWidgetConfig = (): Record<string, { visible: boolean; x: number; y: number; w: number; h: number }> => {
    try {
      const saved = localStorage.getItem('dashboardWidgetConfig');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load dashboard config:", e);
      return {};
    }
  };

  // State for customization mode
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [showHiddenDialog, setShowHiddenDialog] = useState<boolean>(false);
  const [hasLayoutChanged, setHasLayoutChanged] = useState<boolean>(false);
  
  // Store widget configuration
  const [widgetConfig, setWidgetConfig] = useState<Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>>(() => getSavedWidgetConfig());
  
  // Generate initial layout from widget config or defaults
  const generateLayout = (): LayoutItem[] => {
    // Track occupied space to prevent overlaps
    const occupiedSpaces: Record<string, boolean> = {};
    
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
          
          // Check each cell the widget would occupy
          for (let i = x; i < x + w; i++) {
            for (let j = y; j < y + h; j++) {
              const posKey = `${i},${j}`;
              if (occupiedSpaces[posKey]) {
                validPosition = false;
                break;
              }
            }
            if (!validPosition) break;
          }
          
          if (validPosition) {
            // Mark this space as occupied
            for (let i = x; i < x + w; i++) {
              for (let j = y; j < y + h; j++) {
                occupiedSpaces[`${i},${j}`] = true;
              }
            }
            
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
            let positionFree = true;
            
            // Check each cell
            for (let i = x; i < x + w && positionFree; i++) {
              for (let j = y; j < y + h && positionFree; j++) {
                if (occupiedSpaces[`${i},${j}`]) {
                  positionFree = false;
                }
              }
            }
            
            if (positionFree) {
              // Mark this space as occupied
              for (let i = x; i < x + w; i++) {
                for (let j = y; j < y + h; j++) {
                  occupiedSpaces[`${i},${j}`] = true;
                }
              }
              
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
            }
          }
        }
      }
    });
    
    return layout;
  };

  const [currentLayout, setCurrentLayout] = useState<LayoutItem[]>(generateLayout);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  
  // Update hidden widgets list
  useEffect(() => {
    const hidden = Object.entries(widgetConfig)
      .filter(([_, config]) => !config.visible)
      .map(([id]) => id);
    setHiddenWidgets(hidden);
  }, [widgetConfig]);

  // Save the widget configuration to localStorage
  const saveLayout = () => {
    try {
      const config: Record<string, { visible: boolean; x: number; y: number; w: number; h: number }> = {};
      
      // Process visible widgets from current layout
      currentLayout.forEach(item => {
        config[item.i] = {
          visible: true,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        };
      });
      
      // Add hidden widgets
      Object.entries(widgetConfig)
        .filter(([_, cfg]) => !cfg.visible)
        .forEach(([id, cfg]) => {
          config[id] = { ...cfg, visible: false };
        });
      
      localStorage.setItem('dashboardWidgetConfig', JSON.stringify(config));
      setWidgetConfig(config);
      setHasLayoutChanged(false);
      toast.success("Dashboard layout saved");
    } catch (e) {
      console.error("Failed to save dashboard config:", e);
      toast.error("Failed to save layout");
    }
  };

  // Handle layout changes
  const handleLayoutChange = (layout: LayoutItem[]) => {
    // Validate if any widgets would overlap
    let isValid = true;
    const gridPositions: Record<string, boolean> = {};
    
    layout.forEach(item => {
      // Check each cell position this widget covers
      for (let x = item.x; x < item.x + item.w; x++) {
        for (let y = item.y; y < item.y + item.h; y++) {
          const key = `${x},${y}`;
          if (gridPositions[key]) {
            // Found overlap!
            isValid = false;
          }
          gridPositions[key] = true;
        }
      }
    });
    
    if (isValid) {
      setCurrentLayout(layout);
      setHasLayoutChanged(true);
    } else {
      // Could show a warning toast or adjust layout to prevent overlap
      toast.warning("Widget overlapping detected - please adjust your layout");
    }
  };

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
      let bestX = 0;
      let bestY = 0;
      
      // Find maximum Y position currently occupied
      const maxY = currentLayout.reduce((max, item) => 
        Math.max(max, item.y + item.h), 0);
      
      // Add new widget at the bottom
      bestY = maxY;
      
      const newItem: LayoutItem = {
        i: id,
        x: bestX,
        y: bestY,
        w: initialWidgetDefinitions[id].columnSpan * 3,
        h: defaultHeights[id] || 8,
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

  // Reset to default layout
  const resetLayout = () => {
    localStorage.removeItem('dashboardWidgetConfig');
    setWidgetConfig({});
    setCurrentLayout(generateLayout());
    toast.success("Dashboard reset to default layout");
    setHasLayoutChanged(false);
  };
  
  // Toggle customization mode
  const toggleCustomizationMode = () => {
    if (isCustomizing && hasLayoutChanged) {
      // Prompt to save changes
      saveLayout();
    }
    setIsCustomizing(prev => !prev);
    if (!isCustomizing) {
      toast.info("Customization mode active - drag widgets to rearrange or resize");
    }
  };
  
  // Cancel customization without saving
  const cancelCustomization = () => {
    setCurrentLayout(generateLayout());
    setHasLayoutChanged(false);
    setIsCustomizing(false);
    toast.info("Changes canceled");
  };

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
