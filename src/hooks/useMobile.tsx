
import { useState, useEffect } from "react";

/**
 * Hook to detect if the current viewport is mobile-sized
 * @param breakpoint The breakpoint for mobile devices (default: 768)
 * @returns Boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount and when window resizes
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

// Re-export useIsMobile as useMobile for backward compatibility
export const useMobile = useIsMobile;

export default useIsMobile;
