
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface PerformanceData {
  pageLoadTime: number;
  memoryUsage: number;
  cumulativeLayoutShift: number;
}

interface PerformanceRecommendationsProps {
  performanceData: PerformanceData;
}

export const PerformanceRecommendations: React.FC<PerformanceRecommendationsProps> = ({
  performanceData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Optimization Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceData.pageLoadTime > 2000 && (
            <div className="p-4 bg-red-50 border-l-4 border-l-red-400 rounded">
              <h4 className="font-medium text-red-800">Slow Page Load Detected</h4>
              <p className="text-sm text-red-700 mt-1">
                Consider implementing code splitting and lazy loading for better performance.
              </p>
            </div>
          )}
          
          {performanceData.memoryUsage > 50 && (
            <div className="p-4 bg-yellow-50 border-l-4 border-l-yellow-400 rounded">
              <h4 className="font-medium text-yellow-800">High Memory Usage</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Check for memory leaks and consider optimizing component re-renders.
              </p>
            </div>
          )}
          
          {performanceData.cumulativeLayoutShift > 0.1 && (
            <div className="p-4 bg-orange-50 border-l-4 border-l-orange-400 rounded">
              <h4 className="font-medium text-orange-800">Layout Instability</h4>
              <p className="text-sm text-orange-700 mt-1">
                Add proper dimensions to images and ensure consistent loading states.
              </p>
            </div>
          )}
          
          <div className="p-4 bg-blue-50 border-l-4 border-l-blue-400 rounded">
            <h4 className="font-medium text-blue-800">General Optimization Tips</h4>
            <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
              <li>Implement React.memo for pure components</li>
              <li>Use useMemo and useCallback for expensive operations</li>
              <li>Optimize images with proper formats and compression</li>
              <li>Minimize bundle size with tree shaking</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
