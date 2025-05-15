
import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { DashboardCalendarSection } from "@/components/dashboard/sections/DashboardCalendarSection";
import { DashboardScheduleSection } from "@/components/dashboard/sections/DashboardScheduleSection";
import { DashboardTimeOffSection } from "@/components/dashboard/sections/DashboardTimeOffSection";
import { DashboardShiftCoverageSection } from "@/components/dashboard/sections/DashboardShiftCoverageSection";
import { DashboardAnnouncementsSection } from "@/components/dashboard/sections/DashboardAnnouncementsSection";
import { DashboardTrainingSection } from "@/components/dashboard/sections/DashboardTrainingSection";
import { DashboardMarketingSection } from "@/components/dashboard/sections/DashboardMarketingSection";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Move } from "lucide-react";

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
  size: number;
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
  // Get saved widget configuration from localStorage if available
  const getSavedWidgetConfig = (): Record<string, number> => {
    try {
      const saved = localStorage.getItem('dashboardWidgetConfig');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load dashboard config:", e);
      return {};
    }
  };

  // Store the widget order - can be customized by the user
  const [widgetOrder, setWidgetOrder] = useState<string[]>([
    'calendar', 'schedule', 'timeOff', 'training', 'shiftCoverage', 'marketing', 'announcements'
  ]);

  // Store widget sizes (default is 1, which will be transformed into actual size)
  const [widgetSizes, setWidgetSizes] = useState<Record<string, number>>(() => getSavedWidgetConfig());
  
  // Store widget visibility state
  const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>({
    calendar: true,
    schedule: true,
    timeOff: true,
    training: true,
    shiftCoverage: true,
    marketing: true,
    announcements: true
  });

  // Store the widgets and their components
  const widgets: Record<string, React.ReactNode> = {
    calendar: (
      <DashboardCalendarSection 
        date={date}
        currentMonth={currentMonth}
        viewMode={viewMode}
        currentUser={currentUser}
        onDateSelect={onDateSelect}
        onViewModeChange={onViewModeChange}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
      />
    ),
    schedule: (
      <DashboardScheduleSection
        isAdmin={isAdmin}
        scheduleData={scheduleData}
        scheduleLoading={scheduleLoading}
        viewAllUrl="/time?tab=work-schedules"
      />
    ),
    timeOff: (
      <DashboardTimeOffSection 
        isAdmin={isAdmin}
        pendingTimeOff={pendingTimeOff}
        userTimeOff={userTimeOff}
        dashboardDataLoading={dashboardDataLoading}
        dashboardDataError={dashboardDataError}
        handleRefreshData={handleRefreshData}
        viewAllUrl="/time?tab=my-requests"
      />
    ),
    training: (
      <DashboardTrainingSection 
        assignedTrainings={assignedTrainings}
        viewAllUrl="/training"
      />
    ),
    shiftCoverage: currentUser && (
      <DashboardShiftCoverageSection
        shiftCoverageMessages={shiftCoverageMessages}
        currentUser={currentUser}
        dashboardDataLoading={dashboardDataLoading}
        dashboardDataError={dashboardDataError}
        handleRefreshData={handleRefreshData}
        viewAllUrl="/time?tab=shift-coverage"
      />
    ),
    marketing: (
      <DashboardMarketingSection 
        viewAllUrl="/marketing"
      />
    ),
    announcements: (
      <DashboardAnnouncementsSection
        announcements={announcements}
        isAdmin={isAdmin}
        viewAllUrl="/communication?tab=announcements"
      />
    ),
  };

  // Widget title map
  const widgetTitles: Record<string, string> = {
    calendar: "Calendar",
    schedule: "Work Schedule",
    timeOff: "Time Off",
    training: "Training",
    shiftCoverage: "Shift Coverage",
    marketing: "Marketing",
    announcements: "Announcements"
  };

  // Get actual size based on widget id (defaults to 100 if not specified)
  const getWidgetSize = (widgetId: string): number => {
    return widgetSizes[widgetId] || 1;
  };

  // Save the widget configuration to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboardWidgetConfig', JSON.stringify(widgetSizes));
    } catch (e) {
      console.error("Failed to save dashboard config:", e);
    }
  }, [widgetSizes]);

  // Handle moving widgets up or down
  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const currentIndex = widgetOrder.indexOf(id);
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < widgetOrder.length - 1)
    ) {
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const newOrder = [...widgetOrder];
      const temp = newOrder[currentIndex];
      newOrder[currentIndex] = newOrder[newIndex];
      newOrder[newIndex] = temp;
      setWidgetOrder(newOrder);
    }
  };

  // Handle toggling widget visibility
  const toggleWidgetVisibility = (id: string) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Render the dashboard with the widgets
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-medium mb-2">Customize Dashboard</h2>
        <p className="text-sm text-gray-500 mb-3">Drag handles to resize widgets or use the controls to rearrange them</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {widgetOrder.map((id) => (
            <div key={id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
              <span className="text-sm font-medium">{widgetTitles[id]}</span>
              <div className="flex-1"></div>
              <Button 
                variant="ghost" 
                size="sm" 
                title={widgetVisibility[id] ? "Hide widget" : "Show widget"}
                className="h-7 w-7 p-0"
                onClick={() => toggleWidgetVisibility(id)}
              >
                {widgetVisibility[id] ? "Hide" : "Show"}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => moveWidget(id, 'up')}
                title="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7"
                onClick={() => moveWidget(id, 'down')}
                title="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <span className="text-xs text-gray-500"><Move className="h-3 w-3 inline" /> Drag to resize</span>
            </div>
          ))}
        </div>
      </div>

      <ResizablePanelGroup 
        direction="vertical"
        className="min-h-[800px]"
      >
        {widgetOrder
          .filter(id => widgetVisibility[id])
          .map((id, index, visibleWidgets) => (
            <React.Fragment key={id}>
              <ResizablePanel defaultSize={getWidgetSize(id) * 100}>
                <div className="p-1 h-full">
                  {widgets[id]}
                </div>
              </ResizablePanel>
              {index < visibleWidgets.length - 1 && (
                <ResizableHandle withHandle />
              )}
            </React.Fragment>
          ))
        }
      </ResizablePanelGroup>
    </div>
  );
};
