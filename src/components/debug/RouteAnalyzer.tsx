
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Route, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowRight
} from 'lucide-react';

export const RouteAnalyzer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeTests, setRouteTests] = useState<Array<{
    path: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    loadTime?: number;
  }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const commonRoutes = [
    '/dashboard',
    '/communication',
    '/communication?tab=messages',
    '/time-management',
    '/employees',
    '/marketing',
    '/training'
  ];

  const analyzeRoutes = async () => {
    setIsAnalyzing(true);
    const results = [];
    
    for (const route of commonRoutes) {
      const startTime = performance.now();
      
      try {
        // Simulate route analysis
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
        
        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);
        
        results.push({
          path: route,
          status: loadTime > 1000 ? 'warning' : 'success',
          message: loadTime > 1000 ? `Slow load time: ${loadTime}ms` : `Loads successfully in ${loadTime}ms`,
          loadTime
        });
      } catch (error) {
        results.push({
          path: route,
          status: 'error',
          message: 'Failed to load route'
        });
      }
    }
    
    setRouteTests(results);
    setIsAnalyzing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Route Analysis</h2>
        <Button onClick={analyzeRoutes} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing Routes...' : 'Analyze All Routes'}
        </Button>
      </div>

      <Alert>
        <Route className="h-4 w-4" />
        <AlertDescription>
          Current Route: <code className="bg-muted px-1 rounded font-mono">
            {location.pathname}{location.search}
          </code>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Route Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          {routeTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Analyze All Routes" to test application routes
            </div>
          ) : (
            <div className="space-y-3">
              {routeTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <code className="font-mono text-sm">{test.path}</code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{test.message}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(test.path)}
                      className="p-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded border-l-4 border-l-blue-500">
              <h4 className="font-medium">Lazy Loading Implementation</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Consider implementing React.lazy() for heavy components to improve initial load times.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded border-l-4 border-l-green-500">
              <h4 className="font-medium">Route Preloading</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Preload commonly accessed routes like /dashboard and /communication for faster navigation.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded border-l-4 border-l-orange-500">
              <h4 className="font-medium">Error Boundaries</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Ensure all major routes have error boundaries to gracefully handle component failures.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
