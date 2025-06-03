
import { useState, useCallback } from 'react';

export interface SidebarWidthConfig {
  collapsed: number;
  expanded: number;
}

const DEFAULT_WIDTH_CONFIG: SidebarWidthConfig = {
  collapsed: 16, // 4rem - wider for better icon visibility
  expanded: 56,  // 14rem - wider for better text visibility
};

export const useSidebarWidth = () => {
  const [widthConfig, setWidthConfig] = useState<SidebarWidthConfig>(DEFAULT_WIDTH_CONFIG);

  const updateWidthConfig = useCallback((newConfig: Partial<SidebarWidthConfig>) => {
    setWidthConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const resetToDefault = useCallback(() => {
    setWidthConfig(DEFAULT_WIDTH_CONFIG);
  }, []);

  const getWidthClasses = useCallback((collapsed: boolean) => {
    return collapsed ? `w-${widthConfig.collapsed}` : `w-${widthConfig.expanded}`;
  }, [widthConfig]);

  const getMainContentStyles = useCallback((collapsed: boolean) => {
    const collapsedWidth = widthConfig.collapsed * 0.25; // Convert to rem
    const expandedWidth = widthConfig.expanded * 0.25;   // Convert to rem
    
    return {
      marginLeft: collapsed ? `${collapsedWidth}rem` : `${expandedWidth}rem`,
      width: collapsed ? `calc(100vw - ${collapsedWidth}rem)` : `calc(100vw - ${expandedWidth}rem)`,
      maxWidth: collapsed ? `calc(100vw - ${collapsedWidth}rem)` : `calc(100vw - ${expandedWidth}rem)`
    };
  }, [widthConfig]);

  return {
    widthConfig,
    updateWidthConfig,
    resetToDefault,
    getWidthClasses,
    getMainContentStyles
  };
};
