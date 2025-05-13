import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import CommunicationPage from "@/components/communication/CommunicationPage";

export default function Communications() {
  const location = useLocation();
  
  useEffect(() => {
    console.log("Communications legacy page loaded, current location:", location);
  }, [location]);
  
  // This is now just a wrapper for the new CommunicationPage
  // Keeping this file for backward compatibility with existing routes
  return (
    <DashboardLayout>
      <CommunicationPage />
    </DashboardLayout>
  );
}
