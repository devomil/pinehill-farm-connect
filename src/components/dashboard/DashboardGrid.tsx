
import React from "react";
import { LayoutItem } from "@/types/dashboard";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "@/components/dashboard/DashboardGrid.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  isCustomizing: boolean;
  layout: LayoutItem[];
  widgets: Record<string, { title: string; component: React.ReactNode }>;
  onLayoutChange: (layout: LayoutItem[]) => void;
  onRemoveWidget: (id: string) => void;
  breakpoints: { lg: number; md: number; sm: number; xs: number; xxs: number };
  cols: { lg: number; md: number; sm: number; xs: number; xxs: number };
  dragHandleClass: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  isCustomizing,
  layout,
  widgets,
  onLayoutChange,
  onRemoveWidget,
  breakpoints,
  cols,
  dragHandleClass,
}) => {
  return (
    <div className="grid-dashboard">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={30}
        containerPadding={[0, 0]}
        margin={[16, 16]}
        onLayoutChange={onLayoutChange}
        isDraggable={isCustomizing}
        isResizable={isCustomizing}
        draggableHandle={`.${dragHandleClass}`}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms={true}
        isBounded={true}
      >
        {layout.map(item => {
          const widgetId = item.i;
          const widget = widgets[widgetId];
          
          if (!widget) return null;
          
          return (
            <div key={widgetId} className="h-full">
              <DashboardWidget
                title={widget.title}
                isCustomizing={isCustomizing}
                onRemove={() => onRemoveWidget(widgetId)}
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
  );
};
