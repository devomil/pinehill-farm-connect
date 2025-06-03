
import { useState, useEffect } from 'react';

interface ResponsiveLayoutConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isExtraLarge: boolean;
  screenWidth: number;
  containerMaxWidth: string;
  gridCols: number;
  sidebarBehavior: 'overlay' | 'push' | 'fixed';
}

export const useResponsiveLayout = (): ResponsiveLayoutConfig => {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024 && screenWidth < 1440;
  const isLargeDesktop = screenWidth >= 1440 && screenWidth < 1920;
  const isExtraLarge = screenWidth >= 1920;

  // Determine container max width based on screen size
  let containerMaxWidth = 'none';
  if (isDesktop) containerMaxWidth = '1200px';
  else if (isLargeDesktop) containerMaxWidth = '1400px';
  else if (isExtraLarge) containerMaxWidth = '1600px';

  // Determine grid columns based on screen size
  let gridCols = 1;
  if (isTablet) gridCols = 2;
  else if (isDesktop) gridCols = 3;
  else if (isLargeDesktop) gridCols = 4;
  else if (isExtraLarge) gridCols = 5;

  // Determine sidebar behavior
  let sidebarBehavior: 'overlay' | 'push' | 'fixed' = 'overlay';
  if (isDesktop) sidebarBehavior = 'push';
  else if (isLargeDesktop || isExtraLarge) sidebarBehavior = 'fixed';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isExtraLarge,
    screenWidth,
    containerMaxWidth,
    gridCols,
    sidebarBehavior
  };
};
