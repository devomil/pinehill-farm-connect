
import { useState } from "react";
import { toast } from "sonner";
import { LayoutItem } from "@/types/dashboard";

interface UseLayoutOperationsProps {
  widgetConfig: Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>;
  setWidgetConfig: React.Dispatch<React.SetStateAction<Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>>>;
  currentLayout: LayoutItem[];
  setCurrentLayout: React.Dispatch<React.SetStateAction<LayoutItem[]>>;
  generateLayout: () => LayoutItem[];
}

export function useLayoutOperations({
  widgetConfig,
  setWidgetConfig,
  currentLayout,
  setCurrentLayout,
  generateLayout
}: UseLayoutOperationsProps) {
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [showHiddenDialog, setShowHiddenDialog] = useState<boolean>(false);
  const [hasLayoutChanged, setHasLayoutChanged] = useState<boolean>(false);

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
    // Accept all layout changes - removed validation to prevent constraint issues
    setCurrentLayout(layout);
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
    setHasLayoutChanged,
    saveLayout,
    handleLayoutChange,
    resetLayout,
    toggleCustomizationMode,
    cancelCustomization
  };
}
