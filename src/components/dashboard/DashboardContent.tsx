
import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/types";
import { DashboardCalendarSection } from "@/components/dashboard/sections/DashboardCalendarSection";
import { DashboardScheduleSection } from "@/components/dashboard/sections/DashboardScheduleSection";
import { DashboardTimeOffSection } from "@/components/dashboard/sections/DashboardTimeOffSection";
import { DashboardShiftCoverageSection } from "@/components/dashboard/sections/DashboardShiftCoverageSection";
import { DashboardAnnouncementsSection } from "@/components/dashboard/sections/DashboardAnnouncementsSection";
import { DashboardTrainingSection } from "@/components/dashboard/sections/DashboardTrainingSection";
import { DashboardMarketingSection } from "@/components/dashboard/sections/DashboardMarketingSection";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Plus, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Add the CSS styles directly in the component to avoid import issues
// These styles are based on react-resizable's CSS but included inline
const resizableStyles = `
.react-resizable {
  position: relative;
}
.react-resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  background-position: bottom right;
  padding: 0 3px 3px 0;
}
.react-resizable-handle-sw {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
  transform: rotate(90deg);
}
.react-resizable-handle-se {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}
.react-resizable-handle-nw {
  top: 0;
  left: 0;
  cursor: nw-resize;
  transform: rotate(180deg);
}
.react-resizable-handle-ne {
  top: 0;
  right: 0;
  cursor: ne-resize;
  transform: rotate(270deg);
}
.react-resizable-handle-w,
.react-resizable-handle-e {
  top: 50%;
  margin-top: -10px;
  cursor: ew-resize;
}
.react-resizable-handle-w {
  left: 0;
  transform: rotate(135deg);
}
.react-resizable-handle-e {
  right: 0;
  transform: rotate(315deg);
}
.react-resizable-handle-n,
.react-resizable-handle-s {
  left: 50%;
  margin-left: -10px;
  cursor: ns-resize;
}
.react-resizable-handle-n {
  top: 0;
  transform: rotate(225deg);
}
.react-resizable-handle-s {
  bottom: 0;
  transform: rotate(45deg);
}

/* Additional grid constraint styles */
.grid-dashboard .react-grid-item {
  transition: all 200ms ease;
  margin-bottom: 16px !important;
}

.grid-dashboard .react-grid-placeholder {
  background: rgba(108, 151, 171, 0.2);
  border: 2px dashed #6c97ab;
  transition-duration: 100ms;
  z-index: 0;
  border-radius: 0.5rem;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.grid-dashboard .react-grid-item.react-grid-item--resizing {
  z-index: 1;
}

@media (max-width: 768px) {
  .grid-dashboard .react-grid-item {
    width: 100% !important;
    transform: none !important;
    position: relative !important;
    left: 0 !important;
    top: auto !important;
    margin-bottom: 16px !important;
  }
  
  .grid-dashboard .react-grid-layout {
    display: flex !important;
    flex-direction: column !important;
    height: auto !important;
  }
}
`;

interface DashboardContentProps {
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

// Widget definition interface
interface WidgetDefinition {
  id: string;
  title: string;
  columnSpan: number;
  order: number;
  component: React.ReactNode;
}

// Layout item interface for react-grid-layout
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;
  isBounded?: boolean;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  isAdmin,
  pendingTimeOff,
  userTimeOff,
  shiftCoverageMessages,
  announcements,
  assignedTrainings,
  currentUser,
  scheduleData,
  scheduleLoading,
  date,
  currentMonth,
  viewMode,
  dashboardDataLoading,
  dashboardDataError,
  handleRefreshData,
  onDateSelect,
  onViewModeChange,
  onPreviousMonth,
  onNextMonth,
}) => {
  // State for customization mode
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [showHiddenDialog, setShowHiddenDialog] = useState<boolean>(false);
  const [hasLayoutChanged, setHasLayoutChanged] = useState<boolean>(false);
  
  // Define default widget heights and column spans
  const defaultHeights: Record<string, number> = {
    calendar: 12,
    schedule: 10,
    timeOff: 10,
    training: 8,
    shiftCoverage: 10,
    marketing: 8,
    announcements: 10
  };

  const columnSpans: Record<string, number> = {
    calendar: 6,
    schedule: 6,
    timeOff: 3,
    training: 3,
    shiftCoverage: 6,
    marketing: 3,
    announcements: 6
  };

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

  // Store widget configuration
  const [widgetConfig, setWidgetConfig] = useState<Record<string, { visible: boolean; x: number; y: number; w: number; h: number }>>(() => getSavedWidgetConfig());

  // Initial widget definitions
  const initialWidgets: Record<string, { title: string; columnSpan: number; component: React.ReactNode }> = {
    calendar: {
      title: "Calendar",
      columnSpan: columnSpans.calendar,
      component: (
        <DashboardCalendarSection 
          date={date}
          currentMonth={currentMonth}
          viewMode={viewMode}
          currentUser={currentUser}
          onDateSelect={onDateSelect}
          onViewModeChange={onViewModeChange}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
          viewAllUrl="/time?tab=team-calendar"
        />
      )
    },
    schedule: {
      title: "Work Schedule",
      columnSpan: columnSpans.schedule,
      component: (
        <DashboardScheduleSection
          isAdmin={isAdmin}
          scheduleData={scheduleData}
          scheduleLoading={scheduleLoading}
          viewAllUrl="/time?tab=work-schedules"
        />
      )
    },
    timeOff: {
      title: "Time Off",
      columnSpan: columnSpans.timeOff,
      component: (
        <DashboardTimeOffSection 
          isAdmin={isAdmin}
          pendingTimeOff={pendingTimeOff}
          userTimeOff={userTimeOff}
          dashboardDataLoading={dashboardDataLoading}
          dashboardDataError={dashboardDataError}
          handleRefreshData={handleRefreshData}
          viewAllUrl="/time?tab=my-requests"
        />
      )
    },
    training: {
      title: "Training",
      columnSpan: columnSpans.training,
      component: (
        <DashboardTrainingSection 
          assignedTrainings={assignedTrainings}
          viewAllUrl="/training"
        />
      )
    },
    shiftCoverage: {
      title: "Shift Coverage",
      columnSpan: columnSpans.shiftCoverage,
      component: currentUser ? (
        <DashboardShiftCoverageSection
          shiftCoverageMessages={shiftCoverageMessages}
          currentUser={currentUser}
          dashboardDataLoading={dashboardDataLoading}
          dashboardDataError={dashboardDataError}
          handleRefreshData={handleRefreshData}
          viewAllUrl="/time?tab=shift-coverage"
        />
      ) : null
    },
    marketing: {
      title: "Marketing",
      columnSpan: columnSpans.marketing,
      component: (
        <DashboardMarketingSection 
          viewAllUrl="/marketing"
        />
      )
    },
    announcements: {
      title: "Announcements",
      columnSpan: columnSpans.announcements,
      component: (
        <DashboardAnnouncementsSection
          announcements={announcements}
          isAdmin={isAdmin}
          viewAllUrl="/communication?tab=announcements"
        />
      )
    }
  };

  // Determine max columns available in the grid
  const maxColumns = 12;

  // Generate initial layout from widget config or defaults with strict grid constraints
  const generateLayout = (): LayoutItem[] => {
    // Track row positions to avoid overlap
    const rowPositions: Record<number, number> = {}; // Key is row index, value is next available y position
    const layout: LayoutItem[] = [];
    
    // Sort widgets by saved y position to maintain vertical ordering
    const sortedWidgets = Object.entries(initialWidgets)
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
        // Determine column position (x) and width (w)
        // If no config, place widget at left (0) or right (6) side of the grid alternating
        const x = config?.x !== undefined ? config.x : (layout.length % 2) * 6;
        
        // Calculate width in grid units, capped by max columns
        const w = config?.w !== undefined ? config.w : (columnSpans[id] || 3);
        
        // Limit width to max columns
        const limitedWidth = Math.min(w, maxColumns);
        
        // Determine row position to avoid overlap
        const rowIdx = Math.floor(x / maxColumns);
        const baseY = rowPositions[rowIdx] || 0;
        
        // Get height from config or use default
        const h = config?.h !== undefined ? config.h : (defaultHeights[id] || 8);
        
        // Create layout item with bounds constraints
        layout.push({
          i: id,
          x,
          y: baseY,
          w: limitedWidth,
          h,
          minW: 3,
          minH: 4,
          isDraggable: true,
          isResizable: true,
          isBounded: true // Ensure widget stays within grid bounds
        });
        
        // Update row position for next widget
        rowPositions[rowIdx] = baseY + h;
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
        w: columnSpans[id] || 3,
        h: defaultHeights[id] || 8,
        minW: 3,
        minH: 4,
        isDraggable: true,
        isResizable: true,
        isBounded: true
      };
      
      setCurrentLayout([...currentLayout, newItem]);
      toast.success(`Added ${initialWidgets[id].title} to dashboard`);
    } else {
      // Hide the widget
      const newWidgetConfig = { ...widgetConfig };
      const currentWidgetConfig = newWidgetConfig[id] || { 
        visible: true,
        x: 0,
        y: 0,
        w: columnSpans[id] || 3,
        h: defaultHeights[id] || 8
      };
      
      // Store position before hiding
      newWidgetConfig[id] = { 
        ...currentWidgetConfig,
        visible: false 
      };
      
      setWidgetConfig(newWidgetConfig);
      setCurrentLayout(currentLayout.filter(item => item.i !== id));
      toast.success(`Removed ${initialWidgets[id].title} from dashboard`);
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

  // Draggable handle class for grid layout
  const dragHandleClass = "drag-handle";

  // Responsive breakpoints
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 12, sm: 12, xs: 6, xxs: 2 };

  return (
    <>
      {/* Inject the resizable styles directly in the component */}
      <style>{resizableStyles}</style>
      
      <div className="space-y-6">
        {/* Dashboard Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Your personalized dashboard</CardDescription>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {isCustomizing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelCustomization}
                      disabled={!hasLayoutChanged}
                      className="flex items-center gap-1"
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetLayout}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={saveLayout}
                      disabled={!hasLayoutChanged}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Layout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCustomizationMode}
                    className="flex items-center gap-1"
                  >
                    Customize Layout
                  </Button>
                )}
                
                <Dialog open={showHiddenDialog} onOpenChange={setShowHiddenDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      Manage Widgets
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage Dashboard Widgets</DialogTitle>
                      <DialogDescription>
                        Choose which widgets to display on your dashboard
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <Tabs defaultValue="visible">
                        <TabsList className="grid grid-cols-2 w-full">
                          <TabsTrigger value="visible">
                            Visible ({currentLayout.length})
                          </TabsTrigger>
                          <TabsTrigger value="hidden">
                            Hidden ({Object.keys(initialWidgets).length - currentLayout.length})
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="visible" className="h-[320px] overflow-y-auto">
                          <div className="space-y-2">
                            {currentLayout.length > 0 ? (
                              currentLayout.map(item => {
                                const widget = initialWidgets[item.i];
                                return (
                                  <div key={item.i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <span className="font-medium">{widget.title}</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleWidgetVisibility(item.i)}
                                          >
                                            <EyeOff className="h-4 w-4" />
                                            <span className="sr-only">Hide {widget.title}</span>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Hide from dashboard</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center p-4 text-gray-500">
                                No visible widgets
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="hidden" className="h-[320px] overflow-y-auto">
                          <div className="space-y-2">
                            {hiddenWidgets.length > 0 ? (
                              hiddenWidgets.map(id => (
                                <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                  <span className="font-medium">{initialWidgets[id].title}</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleWidgetVisibility(id)}
                                        >
                                          <Plus className="h-4 w-4" />
                                          <span className="sr-only">Show {initialWidgets[id].title}</span>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Add to dashboard</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              ))
                            ) : (
                              <div className="text-center p-4 text-gray-500">
                                No hidden widgets
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <DialogFooter>
                      <Button onClick={() => setShowHiddenDialog(false)} variant="accent">
                        Done
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        {isCustomizing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-700">
            <p className="text-sm">
              Customization mode active - drag widgets by their handles to rearrange, or resize them using the corner handles. 
              Click "Save Layout" when you're done.
            </p>
          </div>
        )}
        
        {/* Dashboard Grid */}
        <div className="grid-dashboard">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: currentLayout, md: currentLayout, sm: currentLayout, xs: currentLayout, xxs: currentLayout }}
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={30}
            containerPadding={[0, 0]}
            margin={[16, 16]}
            onLayoutChange={handleLayoutChange}
            isDraggable={isCustomizing}
            isResizable={isCustomizing}
            draggableHandle={`.${dragHandleClass}`}
            compactType="vertical"
            preventCollision={false} // Enable compact algorithm for auto-adjusting positions
            useCSSTransforms={true}
            isBounded={true} // Keep widgets within the container
          >
            {currentLayout.map(item => {
              const widgetId = item.i;
              const widget = initialWidgets[widgetId];
              
              if (!widget) return null;
              
              return (
                <div key={widgetId} className="h-full">
                  <DashboardWidget
                    title={widget.title}
                    isCustomizing={isCustomizing}
                    onRemove={() => toggleWidgetVisibility(widgetId)}
                    dragHandleClass={dragHandleClass}
                    className="h-full"
                  >
                    {widget.component}
                  </DashboardWidget>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
        
        {/* Hidden Widgets Indicator */}
        {hiddenWidgets.length > 0 && !isCustomizing && (
          <Button 
            variant="outline"
            onClick={() => setShowHiddenDialog(true)}
            className="mt-4"
          >
            <Eye className="mr-2 h-4 w-4" />
            {hiddenWidgets.length} hidden widget{hiddenWidgets.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>
    </>
  );
};
