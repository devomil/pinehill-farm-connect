
import React, { useEffect } from "react";
import { LayoutItem } from "@/types/dashboard";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
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
  const responsive = useResponsiveLayout();

  // Responsive breakpoints and columns based on screen size
  const responsiveBreakpoints = {
    xxl: 1920,
    xl: 1440,
    lg: 1024,
    md: 768,
    sm: 480,
    xs: 0
  };

  const responsiveCols = {
    xxl: responsive.isExtraLarge ? 6 : 4,
    xl: responsive.isLargeDesktop ? 4 : 3,
    lg: 3,
    md: 2,
    sm: 1,
    xs: 1
  };

  // Responsive row height based on screen size
  const getRowHeight = () => {
    if (responsive.isExtraLarge) return 40;
    if (responsive.isLargeDesktop) return 35;
    if (responsive.isDesktop) return 30;
    return 25;
  };

  // Responsive margins based on screen size
  const getMargin = (): [number, number] => {
    if (responsive.isExtraLarge) return [16, 16];
    if (responsive.isLargeDesktop) return [12, 12];
    if (responsive.isDesktop) return [8, 8];
    return [4, 4];
  };

  // Load any stored widget sizes from localStorage on component mount
  useEffect(() => {
    try {
      const storedSizes = localStorage.getItem('dashboard-widget-sizes');
      if (storedSizes) {
        const sizeData = JSON.parse(storedSizes);
        const updatedLayout = layout.map(item => {
          if (sizeData[item.i]) {
            return {
              ...item,
              w: sizeData[item.i].w || item.w,
              h: sizeData[item.i].h || item.h
            };
          }
          return item;
        });
        onLayoutChange(updatedLayout);
      }
    } catch (error) {
      console.error("Failed to load widget sizes:", error);
    }
  }, []);

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    onLayoutChange(newLayout);
    
    try {
      const sizeData: Record<string, { w: number, h: number }> = {};
      newLayout.forEach(item => {
        sizeData[item.i] = { w: item.w, h: item.h };
      });
      localStorage.setItem('dashboard-widget-sizes', JSON.stringify(sizeData));
    } catch (error) {
      console.error("Failed to save widget sizes:", error);
    }
  };

  const handleWidgetResize = (widgetId: string, newSize: { width: number, height: number }) => {
    const updatedLayout = layout.map(item => {
      if (item.i === widgetId) {
        return {
          ...item,
          w: Math.round(newSize.width / (responsiveCols.lg / 12)),
          h: Math.round(newSize.height / getRowHeight())
        };
      }
      return item;
    });
    
    handleLayoutChange(updatedLayout);
  };

  return (
    <div className="grid-dashboard w-full max-w-none">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ 
          xxl: layout, 
          xl: layout, 
          lg: layout, 
          md: layout, 
          sm: layout, 
          xs: layout 
        }}
        breakpoints={responsiveBreakpoints}
        cols={responsiveCols}
        rowHeight={getRowHeight()}
        containerPadding={[0, 0]}
        margin={getMargin()}
        onLayoutChange={handleLayoutChange}
        isDraggable={isCustomizing}
        isResizable={isCustomizing}
        draggableHandle={`.${dragHandleClass}`}
        compactType={null}
        preventCollision={true}
        useCSSTransforms={true}
        isBounded={false}
        resizeHandles={['se']}
        autoSize={true}
        width={undefined}
        onResize={(layout, oldItem, newItem) => {
          // Smooth resizing animation during the resize operation
        }}
        resizeHandle={
          <div className="custom-resize-handle">
            <div className="resize-indicator"></div>
          </div>
        }
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
                onResize={(size) => handleWidgetResize(widgetId, size)}
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
