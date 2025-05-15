
import React from "react";
import CommunicationPage from "@/components/communication/CommunicationPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NavigationRecoveryButton } from "@/components/debug/NavigationRecoveryButton";
import { useNavigationDebugger } from "@/hooks/communications/useNavigationDebugger";
import { useLocation } from "react-router-dom";

const Communication = () => {
  const navigationDebugger = useNavigationDebugger();
  const location = useLocation();
  const isRecoveryMode = new URLSearchParams(location.search).get('recovery') === 'true';
  
  // Show the recovery button if there's a loop detected or we're in recovery mode
  const showRecoveryButton = navigationDebugger.hasLoopDetected || isRecoveryMode;

  return (
    <DashboardLayout
      extraHeaderControls={
        showRecoveryButton ? (
          <NavigationRecoveryButton 
            onRecover={navigationDebugger.attemptRecovery} 
            loopDetected={navigationDebugger.hasLoopDetected}
          />
        ) : null
      }
    >
      <CommunicationPage />
    </DashboardLayout>
  );
};

export default Communication;
