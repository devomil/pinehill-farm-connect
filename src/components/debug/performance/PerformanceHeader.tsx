
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PerformanceHeaderProps {
  isMonitoring: boolean;
  onMeasurePerformance: () => void;
}

export const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({
  isMonitoring,
  onMeasurePerformance
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Performance Monitor</h2>
      <Button onClick={onMeasurePerformance} disabled={isMonitoring}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isMonitoring ? 'animate-spin' : ''}`} />
        {isMonitoring ? 'Measuring...' : 'Measure Performance'}
      </Button>
    </div>
  );
};
