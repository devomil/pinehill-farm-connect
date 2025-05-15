
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
import { Eye, Plus, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

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
  
  // Define default widget heights
  const defaultHeights: Record<string, number> = {
    calendar: 12,
    schedule: 10,
    timeOff: 10,
    training: 8,
    shiftCoverage: 10,
    marketing: 8,
    announcements: 10
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
      columnSpan: 2,
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
      columnSpan: 2,
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
      columnSpan: 1,
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
      columnSpan: 1,
      component: (
        <DashboardTrainingSection 
          assignedTrainings={assignedTrainings}
          viewAllUrl="/training"
        />
      )
    },
    shiftCoverage: {
      title: "Shift Coverage",
      columnSpan: 2,
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
      columnSpan: 1,
      component: (
        <DashboardMarketingSection 
          viewAllUrl="/marketing"
        />
      )
    },
    announcements: {
      title: "Announcements",
      columnSpan: 2,
      component: (
        <DashboardAnnouncementsSection
          announcements={announcements}
          isAdmin={isAdmin}
          viewAllUrl="/communication?tab=announcements"
        />
      )
    }
  };

  // Generate initial layout from widget config or defaults
  const generateLayout = (): LayoutItem[] => {
    let y = 0;
    const layout: LayoutItem[] = [];
    
    Object.entries(initialWidgets).forEach(([id, widget], index) => {
      const config = widgetConfig[id];
      const isVisible = config ? config.visible !== false : true;
      
      if (isVisible) {
        const w = config?.w || widget.columnSpan * 3; // Scale columns to fit in grid-12
        const h = config?.h || defaultHeights[id] || 8;
        
        layout.push({
          i: id,
          x: config?.x !== undefined ? config.x : (layout.length % 2) * 6,
          y: config?.y !== undefined ? config.y : y,
          w,
          h,
          minW: 3,
          minH: 4,
          isDraggable: true,
          isResizable: true
        });
        
        // Increment y for default layout
        if (layout.length % 2 === 0) y += 10;
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
    setCurrentLayout(layout);
    setHasLayoutChanged(true);
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
      const widget = initialWidgets[id];
      const newItem: LayoutItem = {
        i: id,
        x: 0,
        y: 0,
        w: widget.columnSpan * 3,
        h: defaultHeights[id] || 8,
        minW: 3,
        minH: 4,
        isDraggable: true,
        isResizable: true
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
        w: initialWidgets[id].columnSpan * 3,
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
  const cols = { lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 };

  return (
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
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-medium text-blue-700">Customization Mode</h3>
              <p className="text-sm text-blue-600">
                {hasLayoutChanged 
                  ? "Drag to reposition widgets • Resize using the bottom-right corner"
                  : "Drag widgets to reposition • Resize using the bottom-right corner"
                }
              </p>
            </div>
            <div className="flex gap-2">
              {hasLayoutChanged && (
                <>
                  <Button variant="outline" size="sm" onClick={cancelCustomization}>
                    Cancel
                  </Button>
                  <Button variant="accent" size="sm" onClick={saveLayout}>
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
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
          useCSSTransforms={true}
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
  );
};
