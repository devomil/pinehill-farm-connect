
import { useEffect, useState } from 'react';

export const useResponsiveLayout = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  
  useEffect(() => {
    const checkSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkSize();
    
    // Listen for window resize
    window.addEventListener('resize', checkSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkSize);
    };
  }, []);
  
  return {
    isMobileView,
    isDesktop: !isMobileView
  };
};
