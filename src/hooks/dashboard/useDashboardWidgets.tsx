
import React from "react";
import { DashboardCalendarSection } from "@/components/dashboard/sections/DashboardCalendarSection";
import { DashboardScheduleSection } from "@/components/dashboard/sections/DashboardScheduleSection";
import { DashboardTimeOffSection } from "@/components/dashboard/sections/DashboardTimeOffSection";
import { DashboardShiftCoverageSection } from "@/components/dashboard/sections/DashboardShiftCoverageSection";
import { DashboardAnnouncementsSection } from "@/components/dashboard/sections/DashboardAnnouncementsSection";
import { DashboardTrainingSection } from "@/components/dashboard/sections/DashboardTrainingSection";
import { DashboardMarketingSection } from "@/components/dashboard/sections/DashboardMarketingSection";
import { UseWidgetHookProps, WidgetHookResult } from "@/components/dashboard/types/dashboardTypes";

export function useDashboardWidgets(props: UseWidgetHookProps): WidgetHookResult {
  // Default heights for widgets
  const defaultHeights: Record<string, number> = {
    schedule: 12,
    timeOff: 10,
    training: 8,
    shiftCoverage: 10,
    marketing: 8,
    announcements: 10
  };

  const columnSpans: Record<string, number> = {
    schedule: 6,
    timeOff: 3,
    training: 3,
    shiftCoverage: 6,
    marketing: 3,
    announcements: 6
  };

  // Define widget definitions and components - removed the "calendar" widget
  const initialWidgetDefinitions: Record<string, { title: string; columnSpan: number }> = {
    schedule: {
      title: "Work Schedule",
      columnSpan: columnSpans.schedule
    },
    timeOff: {
      title: "Time Off",
      columnSpan: columnSpans.timeOff
    },
    training: {
      title: "Training",
      columnSpan: columnSpans.training
    },
    shiftCoverage: {
      title: "Shift Coverage",
      columnSpan: columnSpans.shiftCoverage
    },
    marketing: {
      title: "Marketing",
      columnSpan: columnSpans.marketing
    },
    announcements: {
      title: "Announcements",
      columnSpan: columnSpans.announcements
    }
  };

  // Widget components - removed the "calendar" widget
  const widgetComponents: Record<string, { title: string; component: React.ReactNode }> = {
    schedule: {
      title: "Work Schedule",
      component: (
        <DashboardScheduleSection
          isAdmin={props.isAdmin}
          scheduleData={props.scheduleData}
          scheduleLoading={props.scheduleLoading}
          currentUser={props.currentUser}
          viewAllUrl="/time?tab=work-schedules"
        />
      )
    },
    timeOff: {
      title: "Time Off",
      component: (
        <DashboardTimeOffSection 
          isAdmin={props.isAdmin}
          pendingTimeOff={props.pendingTimeOff}
          userTimeOff={props.userTimeOff}
          dashboardDataLoading={props.dashboardDataLoading}
          dashboardDataError={props.dashboardDataError}
          handleRefreshData={props.handleRefreshData}
          viewAllUrl="/time?tab=my-requests"
        />
      )
    },
    training: {
      title: "Training",
      component: (
        <DashboardTrainingSection 
          assignedTrainings={props.assignedTrainings}
          viewAllUrl="/training"
          isAdmin={props.isAdmin}
        />
      )
    },
    shiftCoverage: {
      title: "Shift Coverage",
      component: props.currentUser ? (
        <DashboardShiftCoverageSection
          shiftCoverageMessages={props.shiftCoverageMessages}
          currentUser={props.currentUser}
          dashboardDataLoading={props.dashboardDataLoading}
          dashboardDataError={props.dashboardDataError}
          handleRefreshData={props.handleRefreshData}
          viewAllUrl="/time?tab=shift-coverage"
        />
      ) : null
    },
    marketing: {
      title: "Marketing",
      component: (
        <DashboardMarketingSection 
          viewAllUrl="/marketing"
          isAdmin={props.isAdmin}
        />
      )
    },
    announcements: {
      title: "Announcements",
      component: (
        <DashboardAnnouncementsSection
          announcements={props.announcements}
          isAdmin={props.isAdmin}
          viewAllUrl="/communication?tab=announcements"
        />
      )
    }
  };

  // Grid configuration
  const gridConfig = {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 12, sm: 12, xs: 6, xxs: 2 }
  };

  return {
    defaultHeights,
    columnSpans,
    initialWidgetDefinitions,
    widgetComponents,
    gridConfig
  };
}
