
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface EmergencyNavigationResetProps {
  onReset: () => void;
  switchCount: number;
}

export function EmergencyNavigationReset({ onReset, switchCount }: EmergencyNavigationResetProps) {
  const navigate = useNavigate();

  const handleEmergencyReset = () => {
    // Clear all navigation state
    window.sessionStorage.clear();
    localStorage.removeItem('last_communication_tab');
    
    // Reset navigation completely
    onReset();
    
    toast.success("Emergency reset completed - navigation restored");
  };

  const handleReturnToDashboard = () => {
    window.sessionStorage.clear();
    navigate('/dashboard', { replace: true });
    toast.success("Returned to dashboard");
  };

  // Determine severity based on switch count
  const severity = switchCount >= 100 ? "CRITICAL" : switchCount >= 50 ? "HIGH" : "MODERATE";
  const alertMessage = switchCount >= 100 
    ? "CRITICAL navigation loop detected!" 
    : switchCount >= 50 
    ? "Rapid navigation loop detected!" 
    : "Navigation instability detected!";

  return (
    <Alert variant="destructive" className="mb-6 border-red-600 bg-red-50">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">
        🚨 NAVIGATION EMERGENCY DETECTED - {severity} LEVEL
      </AlertTitle>
      <AlertDescription className="space-y-4">
        <div className="text-sm">
          <p className="font-semibold">{alertMessage}</p>
          <p>Tab switches: <span className="font-mono bg-red-100 px-1 rounded">{switchCount.toLocaleString()}</span></p>
          <p className="mt-2">The system has activated emergency protection to prevent browser crashes and performance issues.</p>
          {switchCount < 100 && (
            <p className="text-xs mt-1 text-red-700">Emergency threshold lowered to 50 switches for faster detection.</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <Button 
            onClick={handleEmergencyReset}
            className="bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Emergency Reset Navigation
          </Button>
          
          <Button 
            onClick={handleReturnToDashboard}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
        
        <div className="text-xs text-red-600 mt-3 p-2 bg-red-100 rounded">
          <strong>What happened?</strong> A navigation loop caused excessive tab switching ({switchCount} times), which can freeze the browser. 
          The emergency reset will clear all navigation state and restore normal functionality.
        </div>
      </AlertDescription>
    </Alert>
  );
}
