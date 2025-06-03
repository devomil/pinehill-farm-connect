
import React from "react";
import CommunicationPage from "@/components/communication/CommunicationPage";
import { useLocation } from "react-router-dom";

const Communication: React.FC = () => {
  const location = useLocation();
  
  // Add comprehensive debugging
  console.log("Communication page component rendering", {
    pathname: location.pathname,
    search: location.search,
    timestamp: new Date().toISOString()
  });
  
  // Check if we're in emergency mode
  const isEmergency = location.search.includes('emergency=true');
  
  if (isEmergency) {
    // In emergency mode, clear the emergency flag after component loads
    React.useEffect(() => {
      const timer = setTimeout(() => {
        const newUrl = location.pathname + location.search.replace(/[&?]emergency=true/g, '');
        window.history.replaceState(null, '', newUrl);
      }, 1000);
      
      return () => clearTimeout(timer);
    }, [location]);
  }

  // Create a portal-like effect to completely bypass any parent layout
  React.useEffect(() => {
    // Set body styles to ensure no constraints
    const originalBodyStyle = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow
    };
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    // Cleanup function
    return () => {
      document.body.style.margin = originalBodyStyle.margin;
      document.body.style.padding = originalBodyStyle.padding;
      document.body.style.overflow = originalBodyStyle.overflow;
    };
  }, []);

  // Style to completely break out of any layout constraints
  const fullScreenStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#ffffff',
    padding: '0',
    margin: '0',
    zIndex: 999999, // Extremely high z-index
    overflow: 'hidden',
    boxSizing: 'border-box' as const
  };

  console.log("Communication full-screen style applied:", fullScreenStyle);

  return (
    <div style={fullScreenStyle} className="communication-full-screen-wrapper">
      <CommunicationPage />
    </div>
  );
};

export default Communication;
