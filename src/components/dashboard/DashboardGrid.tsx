
import React, { useEffect } from "react";
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
  // Load any stored widget sizes from localStorage on component mount
  useEffect(() => {
    try {
      const storedSizes = localStorage.getItem('dashboard-widget-sizes');
      if (storedSizes) {
        const sizeData = JSON.parse(storedSizes);
        // Apply stored sizes to layout if they exist
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

  // Handle layout changes with collision detection and size persistence
  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    // Process and validate layout before passing up to parent
    onLayoutChange(newLayout);
    
    // Store widget sizes in localStorage
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

  // Function to handle widget resizing
  const handleWidgetResize = (widgetId: string, newSize: { width: number, height: number }) => {
    const updatedLayout = layout.map(item => {
      if (item.i === widgetId) {
        return {
          ...item,
          w: Math.round(newSize.width / (cols.lg / 12)), // Convert pixels to grid units
          h: Math.round(newSize.height / 30) // Assuming rowHeight is 30
        };
      }
      return item;
    });
    
    handleLayoutChange(updatedLayout);
  };

  return (
    <div className="grid-dashboard">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={30}
        containerPadding={[16, 16]}
        margin={[20, 20]}
        onLayoutChange={handleLayoutChange}
        isDraggable={isCustomizing}
        isResizable={isCustomizing}
        draggableHandle={`.${dragHandleClass}`}
        compactType={null} // Set to null to allow free movement (both horizontal and vertical)
        preventCollision={false}
        useCSSTransforms={true}
        isBounded={true}
        resizeHandles={['se']}
        autoSize={true}
        onResize={(layout, oldItem, newItem) => {
          // This ensures smooth resizing animation during the resize operation
          // The final size will be saved in handleLayoutChange when resize is complete
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
