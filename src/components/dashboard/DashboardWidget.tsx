
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GripVertical } from "lucide-react";

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
  return (
    <Card className={`${className} h-full flex flex-col`}>
      {isCustomizing && (
        <div className="bg-blue-50 border-b border-blue-200 p-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`${dragHandleClass} cursor-move p-1 mr-2 rounded hover:bg-blue-100`}>
              <GripVertical className="h-5 w-5 text-blue-500" />
            </div>
            <span className="font-medium text-blue-700">{title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <EyeOff className="h-4 w-4" />
            <span className="sr-only">Remove {title}</span>
          </Button>
        </div>
      )}
      <CardContent className={`flex-1 ${isCustomizing ? 'pt-3' : 'pt-6'}`}>
        {children}
      </CardContent>
    </Card>
  );
};
