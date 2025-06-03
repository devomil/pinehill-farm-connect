
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
    if (!isNaN(numValue) && numValue >= 16 && numValue <= 64) {
      onWidthChange({ ...currentConfig, expanded: numValue });
    }
  };

  const handleCollapsedWidthChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 8 && numValue <= 16) {
      onWidthChange({ ...currentConfig, collapsed: numValue });
    }
  };

  const presetConfigs = [
    { name: 'Narrow', collapsed: 10, expanded: 28 },
    { name: 'Default', collapsed: 10, expanded: 32 },
    { name: 'Wide', collapsed: 10, expanded: 40 },
    { name: 'Extra Wide', collapsed: 12, expanded: 48 }
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
              Collapsed Width ({currentConfig.collapsed * 0.25}rem)
            </Label>
            <Input
              id="collapsed-width"
              type="number"
              min={8}
              max={16}
              value={currentConfig.collapsed}
              onChange={(e) => handleCollapsedWidthChange(e.target.value)}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="expanded-width" className="text-xs">
              Expanded Width ({currentConfig.expanded * 0.25}rem)
            </Label>
            <Input
              id="expanded-width"
              type="number"
              min={16}
              max={64}
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
