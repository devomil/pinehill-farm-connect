
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSidebarWidth, SidebarWidthConfig } from '@/hooks/useSidebarWidth';

interface SidebarWidthControlsProps {
  onWidthChange: (config: SidebarWidthConfig) => void;
  currentConfig: SidebarWidthConfig;
}

export const SidebarWidthControls: React.FC<SidebarWidthControlsProps> = ({
  onWidthChange,
  currentConfig
}) => {
  const handleExpandedWidthChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 32 && numValue <= 80) {
      onWidthChange({ ...currentConfig, expanded: numValue });
    }
  };

  const handleCollapsedWidthChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 12 && numValue <= 24) {
      onWidthChange({ ...currentConfig, collapsed: numValue });
    }
  };

  const presetConfigs = [
    { name: 'Compact', collapsed: 12, expanded: 48 },
    { name: 'Default', collapsed: 16, expanded: 56 },
    { name: 'Wide', collapsed: 16, expanded: 64 },
    { name: 'Extra Wide', collapsed: 20, expanded: 72 }
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Sidebar Width Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="collapsed-width" className="text-xs">
              Collapsed ({(currentConfig.collapsed * 0.25).toFixed(1)}rem)
            </Label>
            <Input
              id="collapsed-width"
              type="number"
              min={12}
              max={24}
              step={2}
              value={currentConfig.collapsed}
              onChange={(e) => handleCollapsedWidthChange(e.target.value)}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="expanded-width" className="text-xs">
              Expanded ({(currentConfig.expanded * 0.25).toFixed(1)}rem)
            </Label>
            <Input
              id="expanded-width"
              type="number"
              min={32}
              max={80}
              step={4}
              value={currentConfig.expanded}
              onChange={(e) => handleExpandedWidthChange(e.target.value)}
              className="h-8"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs mb-2 block">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {presetConfigs.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onWidthChange(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
