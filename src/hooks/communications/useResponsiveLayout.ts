
import { useState, useEffect } from "react";

/**
 * Hook to detect mobile vs desktop view for responsive layouts
 */
export function useResponsiveLayout() {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return { isMobileView };
}
