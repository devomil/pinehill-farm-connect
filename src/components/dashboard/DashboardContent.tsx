
import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { DashboardCalendarSection } from "@/components/dashboard/sections/DashboardCalendarSection";
import { DashboardScheduleSection } from "@/components/dashboard/sections/DashboardScheduleSection";
import { DashboardTimeOffSection } from "@/components/dashboard/sections/DashboardTimeOffSection";
import { DashboardShiftCoverageSection } from "@/components/dashboard/sections/DashboardShiftCoverageSection";
import { DashboardAnnouncementsSection } from "@/components/dashboard/sections/DashboardAnnouncementsSection";
import { DashboardTrainingSection } from "@/components/dashboard/sections/DashboardTrainingSection";
import { DashboardMarketingSection } from "@/components/dashboard/sections/DashboardMarketingSection";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, EyeOff, Eye, GripVertical, X } from "lucide-react";
import { toast } from "sonner";
import { DialogClose } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

// Widget configuration interface
interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  columnSpan: number;
  order: number;
  component: React.ReactNode;
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
  
  // Get saved widget configuration from localStorage if available
  const getSavedWidgetConfig = (): Record<string, { visible: boolean; order: number; columnSpan: number }> => {
    try {
      const saved = localStorage.getItem('dashboardWidgetConfig');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load dashboard config:", e);
      return {};
    }
  };

  // Store widget configuration
  const [widgetConfig, setWidgetConfig] = useState<Record<string, { visible: boolean; order: number; columnSpan: number }>>(() => getSavedWidgetConfig());

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

  // Create widgets array
  const getWidgets = (): WidgetConfig[] => {
    return Object.entries(initialWidgets).map(([id, widget]) => {
      const config = widgetConfig[id] || { visible: true, order: 0, columnSpan: widget.columnSpan };
      
      return {
        id,
        title: widget.title,
        visible: config.visible !== false, // Default to true if not specified
        columnSpan: config.columnSpan || widget.columnSpan,
        order: config.order || 0,
        component: widget.component
      };
    }).sort((a, b) => a.order - b.order);
  };

  const [widgets, setWidgets] = useState<WidgetConfig[]>(getWidgets());
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);

  // Update hidden widgets list
  useEffect(() => {
    const hidden = widgets.filter(widget => !widget.visible).map(widget => widget.id);
    setHiddenWidgets(hidden);
  }, [widgets]);

  // Save the widget configuration to localStorage
  useEffect(() => {
    try {
      const config: Record<string, { visible: boolean; order: number; columnSpan: number }> = {};
      widgets.forEach(widget => {
        config[widget.id] = {
          visible: widget.visible,
          order: widget.order,
          columnSpan: widget.columnSpan
        };
      });
      localStorage.setItem('dashboardWidgetConfig', JSON.stringify(config));
      setWidgetConfig(config);
    } catch (e) {
      console.error("Failed to save dashboard config:", e);
    }
  }, [widgets]);

  // Toggle widget visibility
  const toggleWidgetVisibility = (id: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id 
          ? { ...widget, visible: !widget.visible } 
          : widget
      )
    );
    toast.success(`${widgets.find(w => w.id === id)?.visible ? "Hidden" : "Showed"} ${widgets.find(w => w.id === id)?.title} widget`);
  };

  // Move widget up in order
  const moveWidgetUp = (id: string) => {
    setWidgets(prev => {
      const index = prev.findIndex(widget => widget.id === id);
      if (index <= 0) return prev;
      
      const newWidgets = [...prev];
      
      // Swap orders
      const tempOrder = newWidgets[index].order;
      newWidgets[index].order = newWidgets[index - 1].order;
      newWidgets[index - 1].order = tempOrder;
      
      // Re-sort based on new orders
      return [...newWidgets].sort((a, b) => a.order - b.order);
    });
  };

  // Move widget down in order
  const moveWidgetDown = (id: string) => {
    setWidgets(prev => {
      const index = prev.findIndex(widget => widget.id === id);
      if (index >= prev.length - 1) return prev;
      
      const newWidgets = [...prev];
      
      // Swap orders
      const tempOrder = newWidgets[index].order;
      newWidgets[index].order = newWidgets[index + 1].order;
      newWidgets[index + 1].order = tempOrder;
      
      // Re-sort based on new orders
      return [...newWidgets].sort((a, b) => a.order - b.order);
    });
  };

  // Toggle customization mode
  const toggleCustomizationMode = () => {
    setIsCustomizing(prev => !prev);
    if (isCustomizing) {
      toast.success("Dashboard layout saved");
    } else {
      toast.info("Customization mode active - drag widgets to rearrange");
    }
  };

  // Reset to default layout
  const resetLayout = () => {
    const defaultLayout = Object.entries(initialWidgets).map(([id, widget], index) => ({
      id,
      title: widget.title,
      visible: true,
      columnSpan: widget.columnSpan,
      order: index,
      component: widget.component
    }));
    
    setWidgets(defaultLayout);
    localStorage.removeItem('dashboardWidgetConfig');
    toast.success("Dashboard reset to default layout");
    setIsCustomizing(false);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Customize your dashboard layout</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={isCustomizing ? "accent" : "outline"}
                onClick={toggleCustomizationMode}
                className="flex items-center gap-1"
              >
                {isCustomizing ? "Save Layout" : "Customize Layout"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
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
                    <Tabs defaultValue="visible" className="w-full">
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="visible">Visible ({widgets.filter(w => w.visible).length})</TabsTrigger>
                        <TabsTrigger value="hidden">Hidden ({widgets.filter(w => !w.visible).length})</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="visible">
                        <div className="space-y-2">
                          {widgets.filter(widget => widget.visible).map(widget => (
                            <div key={widget.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div className="flex items-center">
                                <GripVertical className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{widget.title}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleWidgetVisibility(widget.id)}
                              >
                                <EyeOff className="h-4 w-4" />
                                <span className="sr-only">Hide {widget.title}</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="hidden">
                        <div className="space-y-2">
                          {widgets.filter(widget => !widget.visible).length > 0 ? (
                            widgets.filter(widget => !widget.visible).map(widget => (
                              <div key={widget.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                <span>{widget.title}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleWidgetVisibility(widget.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Show {widget.title}</span>
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 py-4">
                              No hidden widgets
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={resetLayout}>
                      Reset Layout
                    </Button>
                    <DialogClose asChild>
                      <Button variant="accent">Done</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {isCustomizing && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-700">Customization Mode</h3>
              <p className="text-sm text-blue-600">Rearrange your widgets by dragging them to your preferred position</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetLayout}>
                Reset Layout
              </Button>
              <Button variant="accent" size="sm" onClick={toggleCustomizationMode}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {widgets
          .filter(widget => widget.visible)
          .map(widget => (
            <div 
              key={widget.id}
              className={`${
                widget.columnSpan === 2 ? "md:col-span-2" : "md:col-span-1"
              } ${isCustomizing ? "cursor-move" : ""}`}
            >
              {isCustomizing ? (
                <div className="relative group bg-white p-4 rounded-lg border-2 border-dashed border-blue-300 min-h-[100px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <GripVertical className="h-5 w-5 mr-2 text-blue-500" />
                      <h3 className="font-medium">{widget.title}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => moveWidgetUp(widget.id)}
                        className="h-8 w-8 p-1"
                      >
                        <ArrowUpDown className="h-4 w-4 rotate-90" />
                        <span className="sr-only">Move {widget.title} up</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className="h-8 w-8 p-1"
                      >
                        <EyeOff className="h-4 w-4" />
                        <span className="sr-only">Hide {widget.title}</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="py-4 text-center text-sm text-gray-500">
                    {widget.title} Widget
                  </div>
                </div>
              ) : (
                widget.component
              )}
            </div>
          ))}
      </div>
      
      {/* Hidden Widgets Indicator */}
      {hiddenWidgets.length > 0 && !isCustomizing && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => document.querySelector('[data-dialog-trigger="true"]')?.dispatchEvent(new MouseEvent('click'))}
        >
          <Eye className="mr-2 h-4 w-4" />
          {hiddenWidgets.length} hidden widget{hiddenWidgets.length !== 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
};
