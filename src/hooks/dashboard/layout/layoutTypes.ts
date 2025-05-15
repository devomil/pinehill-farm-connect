
import { LayoutItem } from "@/types/dashboard";

export interface LayoutConfig {
  visible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PositionMap {
  [key: string]: boolean;
}

export interface UseDashboardLayoutProps {
  initialWidgetDefinitions: Record<string, { title: string; columnSpan: number }>;
  defaultHeights: Record<string, number>;
}

export interface UseDashboardLayoutResult {
  isCustomizing: boolean;
  setIsCustomizing: (value: boolean) => void;
  showHiddenDialog: boolean;
  setShowHiddenDialog: (open: boolean) => void;
  hasLayoutChanged: boolean;
  widgetConfig: Record<string, LayoutConfig>;
  currentLayout: LayoutItem[];
  hiddenWidgets: string[];
  saveLayout: () => void;
  handleLayoutChange: (layout: LayoutItem[]) => void;
  toggleWidgetVisibility: (id: string) => void;
  resetLayout: () => void;
  toggleCustomizationMode: () => void;
  cancelCustomization: () => void;
}
