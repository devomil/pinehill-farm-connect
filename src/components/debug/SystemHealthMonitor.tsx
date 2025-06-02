
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Database,
  Network,
  Code,
  Monitor
} from 'lucide-react';

interface SystemHealthMonitorProps {
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({ systemHealth }) => {
  const [healthMetrics, setHealthMetrics] = useState({
    frontend: 95,
    backend: 98,
    database: 92,
    network: 88,
    performance: 85
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate metric updates
    setHealthMetrics({
      frontend: Math.floor(Math.random() * 20) + 80,
      backend: Math.floor(Math.random() * 15) + 85,
      database: Math.floor(Math.random() * 25) + 75,
      network: Math.floor(Math.random() * 30) + 70,
      performance: Math.floor(Math.random() * 35) + 65
    });
    
    setIsRefreshing(false);
  };

  const getMetricStatus = (value: number) => {
    if (value >= 90) return { icon: CheckCircle, color: 'text-green-500', status: 'Excellent' };
    if (value >= 70) return { icon: AlertTriangle, color: 'text-yellow-500', status: 'Good' };
    return { icon: XCircle, color: 'text-red-500', status: 'Needs Attention' };
  };

  const metrics = [
    { key: 'frontend', label: 'Frontend Health', icon: Monitor, value: healthMetrics.frontend },
    { key: 'backend', label: 'Backend Health', icon: Code, value: healthMetrics.backend },
    { key: 'database', label: 'Database Health', icon: Database, value: healthMetrics.database },
    { key: 'network', label: 'Network Health', icon: Network, value: healthMetrics.network },
    { key: 'performance', label: 'Performance Score', icon: RefreshCw, value: healthMetrics.performance }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Health Overview</h2>
        <Button onClick={refreshMetrics} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const status = getMetricStatus(metric.value);
          const StatusIcon = status.icon;
          const MetricIcon = metric.icon;
          
          return (
            <Card key={metric.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MetricIcon className="h-4 w-4" />
                  {metric.label}
                </CardTitle>
                <StatusIcon className={`h-4 w-4 ${status.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}%</div>
                <Progress value={metric.value} className="mt-2" />
                <Badge variant="outline" className="mt-2">
                  {status.status}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Health Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>React Components Loading</span>
              </div>
              <Badge variant="outline">Healthy</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Supabase Connection</span>
              </div>
              <Badge variant="outline">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>Console Warnings</span>
              </div>
              <Badge variant="secondary">2 Minor Issues</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Navigation System</span>
              </div>
              <Badge variant="outline">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
