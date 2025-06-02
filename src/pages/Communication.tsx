
import React from "react";
import CommunicationPage from "@/components/communication/CommunicationPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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

  // Add debug styles that should be very visible
  const debugWrapperStyle = {
    backgroundColor: '#ff0000',
    border: '5px solid #00ff00',
    padding: '0',
    margin: '0',
    minHeight: '100vh',
    width: '100%',
    position: 'relative' as const,
    zIndex: 9999
  };

  console.log("Communication wrapper style applied:", debugWrapperStyle);

  return (
    <DashboardLayout>
      <div style={debugWrapperStyle} className="communication-debug-wrapper">
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
          COMMUNICATION PAGE LOADED - {new Date().toLocaleTimeString()}
        </div>
        <CommunicationPage />
      </div>
    </DashboardLayout>
  );
};

export default Communication;
