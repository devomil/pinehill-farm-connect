
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';

interface PerformanceMetricCardProps {
  metric: {
    key: string;
    label: string;
    value: number;
    unit: string;
    description: string;
  };
}

export const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({ metric }) => {
  const getPerformanceScore = (metricKey: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      pageLoadTime: { good: 1000, poor: 3000 },
      firstContentfulPaint: { good: 1000, poor: 3000 },
      largestContentfulPaint: { good: 2500, poor: 4000 },
      cumulativeLayoutShift: { good: 0.1, poor: 0.25 },
      firstInputDelay: { good: 100, poor: 300 },
      memoryUsage: { good: 30, poor: 60 },
      bundleSize: { good: 250, poor: 500 }
    };

    const threshold = thresholds[metricKey];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'good': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'needs-improvement': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'poor': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const score = getPerformanceScore(metric.key, metric.value);
  const scoreIcon = getScoreIcon(score);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
        {scoreIcon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {metric.value}{metric.unit}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {metric.description}
        </p>
        <Badge variant="outline" className={`mt-2 ${getScoreColor(score)}`}>
          {score.replace('-', ' ')}
        </Badge>
      </CardContent>
    </Card>
  );
};
