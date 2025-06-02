
import React from "react";
import CommunicationPage from "@/components/communication/CommunicationPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLocation } from "react-router-dom";

const Communication: React.FC = () => {
  const location = useLocation();
  
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

  return (
    <DashboardLayout>
      <CommunicationPage />
    </DashboardLayout>
  );
};

export default Communication;
