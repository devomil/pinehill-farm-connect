
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

  // Style to break out of the sidebar layout and take full width
  const fullWidthStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#ff0000',
    border: '5px solid #00ff00',
    padding: '0',
    margin: '0',
    zIndex: 9999,
    overflow: 'auto'
  };

  console.log("Communication full-width style applied:", fullWidthStyle);

  return (
    <div style={fullWidthStyle} className="communication-full-width-wrapper">
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        backgroundColor: 'yellow', 
        color: 'black', 
        padding: '5px',
        zIndex: 10000,
        fontSize: '12px'
      }}>
        COMMUNICATION PAGE LOADED (FULL WIDTH) - {new Date().toLocaleTimeString()}
      </div>
      <CommunicationPage />
    </div>
  );
};

export default Communication;
