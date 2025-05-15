
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RotateCcw, Save, Eye } from "lucide-react";

interface DashboardControlsProps {
  isCustomizing: boolean;
  hasLayoutChanged: boolean;
  onToggleCustomization: () => void;
  onCancel: () => void;
  onReset: () => void;
  onSave: () => void;
  onOpenWidgetManager: () => void;
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({
  isCustomizing,
  hasLayoutChanged,
  onToggleCustomization,
  onCancel,
  onReset,
  onSave,
  onOpenWidgetManager,
}) => {
  return (
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
                  onClick={onCancel}
                  disabled={!hasLayoutChanged}
                  className="flex items-center gap-1"
                >
                  Cancel
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                
                <Button
                  variant="accent"
                  size="sm"
                  onClick={onSave}
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
                onClick={onToggleCustomization}
                className="flex items-center gap-1"
              >
                Customize Layout
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={onOpenWidgetManager}>
              <Eye className="mr-1 h-4 w-4" />
              Manage Widgets
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
