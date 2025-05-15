
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeOff, GripVertical } from "lucide-react";

interface DashboardWidgetProps {
  title: string;
  isCustomizing: boolean;
  onRemove: () => void;
  className?: string;
  children: React.ReactNode;
  dragHandleClass?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  isCustomizing,
  onRemove,
  className = "",
  children,
  dragHandleClass,
}) => {
  // Check if widget has content
  const hasContent = React.Children.count(children) > 0;
  
  return (
    <Card className={`${className} h-full flex flex-col transition-shadow ${isCustomizing ? 'shadow-lg' : 'shadow'}`}>
      {isCustomizing && (
        <div className="bg-blue-50 border-b border-blue-200 p-2 flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className={`${dragHandleClass} cursor-move p-1 mr-2 rounded hover:bg-blue-100 flex items-center justify-center`}
              title="Drag to move widget"
            >
              <GripVertical className="h-5 w-5 text-blue-500" />
            </div>
            <span className="font-medium text-blue-700">{title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0"
            title="Hide widget"
          >
            <EyeOff className="h-4 w-4" />
            <span className="sr-only">Remove {title}</span>
          </Button>
        </div>
      )}
      <CardContent className={`flex-1 ${isCustomizing ? 'pt-3' : 'pt-6'} overflow-auto`}>
        {hasContent ? (
          children
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-center">No data available for this widget.</p>
            <p className="text-sm text-center mt-1">Content will appear here when available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
