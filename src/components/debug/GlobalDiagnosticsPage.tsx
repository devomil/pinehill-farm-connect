
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Bug, 
  Monitor, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Code, 
  Database,
  Route,
  Zap,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { useDebugContext } from '@/contexts/DebugContext';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { RouteAnalyzer } from './RouteAnalyzer';
import { ComponentAnalyzer } from './ComponentAnalyzer';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorTracker } from './ErrorTracker';

export const GlobalDiagnosticsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { debugMode, setDebugMode } = useDebugContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);

  // Enable debug mode when accessing diagnostics
  useEffect(() => {
    if (!debugMode) {
      setDebugMode(true);
    }
  }, [debugMode, setDebugMode]);

  const runFullDiagnostics = async () => {
    setDiagnosticsRunning(true);
    
    // Simulate comprehensive system check
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Analyze system health based on various factors
    const errorCount = document.querySelectorAll('[data-error]').length;
    const consoleErrors = performance.getEntriesByType('navigation').length;
    
    if (errorCount > 5 || consoleErrors > 10) {
      setSystemHealth('critical');
    } else if (errorCount > 2 || consoleErrors > 5) {
      setSystemHealth('warning');
    } else {
      setSystemHealth('healthy');
    }
    
    setDiagnosticsRunning(false);
  };

  const getHealthStatusInfo = () => {
    switch (systemHealth) {
      case 'critical':
        return {
          icon: <AlertCircle className="h-5 w-5 text-destructive" />,
          text: 'Critical Issues Detected',
          description: 'Multiple errors found that require immediate attention',
          variant: 'destructive' as const
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          text: 'Warning: Issues Found',
          description: 'Some issues detected that should be addressed',
          variant: 'default' as const
        };
      default:
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'System Healthy',
          description: 'No critical issues detected',
          variant: 'default' as const
        };
    }
  };

  const healthInfo = getHealthStatusInfo();

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bug className="h-8 w-8" />
              Global Diagnostics Center
            </h1>
            <p className="text-muted-foreground">
              Comprehensive debugging and diagnostics for the entire application
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={healthInfo.variant} className="flex items-center gap-1">
            {healthInfo.icon}
            {healthInfo.text}
          </Badge>
          <Button 
            onClick={runFullDiagnostics} 
            disabled={diagnosticsRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
            {diagnosticsRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </Button>
        </div>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>System Status</AlertTitle>
        <AlertDescription>
          {healthInfo.description}
          <div className="mt-2 text-sm">
            Current Route: <code className="bg-muted px-1 rounded">{location.pathname}{location.search}</code>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Errors
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SystemHealthMonitor systemHealth={systemHealth} />
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <RouteAnalyzer />
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <ComponentAnalyzer />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="errors" className="mt-6">
          <ErrorTracker />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <DiagnosticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
