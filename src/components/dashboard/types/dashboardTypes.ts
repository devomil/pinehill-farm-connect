
import { User } from "@/types/index";
import { LayoutItem } from "@/types/dashboard";

export interface DashboardContentProps {
  isAdmin: boolean;
  pendingTimeOff: any[] | null;
  userTimeOff: any[] | null;
  shiftCoverageMessages: any[] | null;
  announcements: any[] | null;
  assignedTrainings: any[] | null;
  currentUser: User;
  scheduleData: any;
  scheduleLoading: boolean;
  date: Date;
  currentMonth: Date;
  viewMode: "month" | "team";
  dashboardDataLoading: boolean;
  dashboardDataError: Error | null;
  handleRefreshData: () => void;
  onDateSelect: (date: Date | undefined) => void;
  onViewModeChange: (value: "month" | "team") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export interface DashboardControlsProps {
  isCustomizing: boolean;
  hasLayoutChanged: boolean;
  onToggleCustomization: () => void;
  onCancel: () => void;
  onReset: () => void;
  onSave: () => void;
  onOpenWidgetManager: () => void;
}

export interface WidgetManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLayout: LayoutItem[];
  hiddenWidgets: string[];
  toggleWidgetVisibility: (id: string) => void;
  widgetDefinitions: Record<string, { title: string; columnSpan: number }>;
}

export interface DashboardLayoutHookResult {
  isCustomizing: boolean;
  setIsCustomizing: (value: boolean) => void;
  showHiddenDialog: boolean;
  setShowHiddenDialog: (open: boolean) => void;
  hasLayoutChanged: boolean;
  widgetConfig: Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>;
  currentLayout: LayoutItem[];
  hiddenWidgets: string[];
  saveLayout: () => void;
  handleLayoutChange: (layout: LayoutItem[]) => void;
  toggleWidgetVisibility: (id: string) => void;
  resetLayout: () => void;
  toggleCustomizationMode: () => void;
  cancelCustomization: () => void;
}

export interface UseWidgetHookProps {
  isAdmin: boolean;
  pendingTimeOff: any[] | null;
  userTimeOff: any[] | null;
  shiftCoverageMessages: any[] | null;
  announcements: any[] | null;
  assignedTrainings: any[] | null;
  currentUser: User;
  scheduleData: any;
  scheduleLoading: boolean;
  date: Date;
  currentMonth: Date;
  viewMode: "month" | "team";
  dashboardDataLoading: boolean;
  dashboardDataError: Error | null;
  handleRefreshData: () => void;
  onDateSelect: (date: Date | undefined) => void;
  onViewModeChange: (value: "month" | "team") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export interface WidgetHookResult {
  defaultHeights: Record<string, number>;
  columnSpans: Record<string, number>;
  initialWidgetDefinitions: Record<string, { title: string; columnSpan: number }>;
  widgetComponents: Record<string, { title: string; component: React.ReactNode }>;
  gridConfig: {
    breakpoints: { lg: number; md: number; sm: number; xs: number; xxs: number };
    cols: { lg: number; md: number; sm: number; xs: number; xxs: number };
  };
}
