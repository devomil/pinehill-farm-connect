
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Code, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export const ComponentAnalyzer: React.FC = () => {
  const [components, setComponents] = useState<Array<{
    name: string;
    renderCount: number;
    lastRender: Date;
    status: 'healthy' | 'warning' | 'error';
    memoryUsage: number;
    props: number;
  }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState('');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Simulate component analysis
    const mockComponents = [
      { name: 'CommunicationPage', renderCount: 45, status: 'healthy', memoryUsage: 2.1, props: 8 },
      { name: 'Sidebar', renderCount: 12, status: 'healthy', memoryUsage: 0.8, props: 3 },
      { name: 'EmployeeCommunications', renderCount: 67, status: 'warning', memoryUsage: 4.2, props: 12 },
      { name: 'AnnouncementManager', renderCount: 23, status: 'healthy', memoryUsage: 1.5, props: 6 },
      { name: 'DiagnosticsPanel', renderCount: 89, status: 'warning', memoryUsage: 3.7, props: 15 },
      { name: 'MessageConversation', renderCount: 156, status: 'error', memoryUsage: 6.8, props: 22 }
    ].map(comp => ({
      ...comp,
      lastRender: new Date(Date.now() - Math.random() * 3600000),
      status: comp.status as 'healthy' | 'warning' | 'error'
    }));
    
    setComponents(mockComponents);
  }, []);

  const analyzeComponents = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update component stats
    setComponents(prev => prev.map(comp => ({
      ...comp,
      renderCount: comp.renderCount + Math.floor(Math.random() * 10),
      lastRender: new Date(),
      memoryUsage: Math.round((comp.memoryUsage + (Math.random() - 0.5) * 0.5) * 10) / 10
    })));
    
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredComponents = components.filter(comp =>
    comp.name.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleDetails = (componentName: string) => {
    setShowDetails(prev => ({
      ...prev,
      [componentName]: !prev[componentName]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Component Analysis</h2>
        <Button onClick={analyzeComponents} disabled={isAnalyzing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter components..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredComponents.length} components
        </Badge>
      </div>

      <div className="grid gap-4">
        {filteredComponents.map((component) => (
          <Card key={component.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {component.name}
                  {getStatusIcon(component.status)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={component.status === 'healthy' ? 'default' : 'destructive'}>
                    {component.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDetails(component.name)}
                  >
                    {showDetails[component.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Render Count</div>
                  <div className="text-lg font-semibold">{component.renderCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Memory (MB)</div>
                  <div className="text-lg font-semibold">{component.memoryUsage}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Props Count</div>
                  <div className="text-lg font-semibold">{component.props}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Render</div>
                  <div className="text-sm">{component.lastRender.toLocaleTimeString()}</div>
                </div>
              </div>

              {component.renderCount > 100 && (
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Render Performance</div>
                  <Progress value={Math.max(0, 100 - component.renderCount / 2)} className="h-2" />
                  <div className="text-xs text-yellow-600 mt-1">
                    High render count detected - consider optimization
                  </div>
                </div>
              )}

              {showDetails[component.name] && (
                <div className="mt-4 p-4 bg-muted/50 rounded">
                  <h4 className="font-medium mb-2">Component Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>Path: <code className="bg-muted px-1 rounded">src/components/...</code></div>
                    <div>Type: Functional Component</div>
                    <div>Hooks Used: useState, useEffect, useMemo</div>
                    <div>Dependencies: React, Lucide Icons, UI Components</div>
                  </div>
                  
                  {component.status !== 'healthy' && (
                    <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-l-yellow-400 rounded">
                      <div className="text-sm">
                        <strong>Optimization Suggestions:</strong>
                        <ul className="list-disc list-inside mt-1">
                          <li>Consider memoizing expensive calculations</li>
                          <li>Implement React.memo for pure components</li>
                          <li>Reduce prop drilling with context</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
