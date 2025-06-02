
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

interface ErrorLog {
  id: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  stack?: string;
  count: number;
}

export const ErrorTracker: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({});
  const [copiedError, setCopiedError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initialize with some mock errors
    const mockErrors: ErrorLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000),
        type: 'error',
        message: 'Cannot read property \'id\' of undefined',
        source: 'EmployeeCommunications.tsx:45',
        stack: 'TypeError: Cannot read property \'id\' of undefined\n    at handleMessageRead (EmployeeCommunications.tsx:45:12)\n    at onClick (MessageItem.tsx:23:5)',
        count: 3
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 600000),
        type: 'warning',
        message: 'React Hook useEffect has a missing dependency',
        source: 'useRefreshMessages.ts:78',
        count: 1
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 900000),
        type: 'error',
        message: 'Network request failed: 500 Internal Server Error',
        source: 'supabase/client.ts:234',
        stack: 'Error: Network request failed\n    at fetch (supabase/client.ts:234:10)\n    at async refreshMessages (useCommunications.ts:56:8)',
        count: 2
      }
    ];
    
    setErrors(mockErrors);

    // Listen for console errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      originalError(...args);
      addError('error', args.join(' '));
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      addError('warning', args.join(' '));
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const addError = (type: 'error' | 'warning' | 'info', message: string) => {
    const errorId = btoa(message).slice(0, 8);
    
    setErrors(prev => {
      const existingError = prev.find(e => e.id === errorId);
      if (existingError) {
        return prev.map(e => 
          e.id === errorId 
            ? { ...e, count: e.count + 1, timestamp: new Date() }
            : e
        );
      }
      
      return [{
        id: errorId,
        timestamp: new Date(),
        type,
        message,
        source: 'Unknown',
        count: 1
      }, ...prev];
    });
  };

  const refreshErrors = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Clear old errors and refresh
    setIsRefreshing(false);
  };

  const toggleError = (errorId: string) => {
    setExpandedErrors(prev => ({
      ...prev,
      [errorId]: !prev[errorId]
    }));
  };

  const copyError = async (error: ErrorLog) => {
    const errorText = `${error.type.toUpperCase()}: ${error.message}\nSource: ${error.source}\nTimestamp: ${error.timestamp.toISOString()}\n${error.stack || ''}`;
    
    try {
      await navigator.clipboard.writeText(errorText);
      setCopiedError(error.id);
      setTimeout(() => setCopiedError(null), 2000);
    } catch (err) {
      console.error('Failed to copy error to clipboard:', err);
    }
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getErrorBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive' as const;
      case 'warning': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Error Tracker</h2>
        <Button onClick={refreshErrors} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {errors.length === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No errors detected. Your application is running smoothly!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Found {errors.length} error{errors.length !== 1 ? 's' : ''} in the application. 
              Click on each error to view details and copy for debugging.
            </AlertDescription>
          </Alert>

          {errors.map((error) => (
            <Card key={error.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getErrorIcon(error.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{error.message}</div>
                      <div className="text-sm text-muted-foreground">
                        {error.source} • {error.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {error.count > 1 && (
                      <Badge variant="outline">{error.count}x</Badge>
                    )}
                    <Badge variant={getErrorBadgeVariant(error.type)}>
                      {error.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyError(error)}
                    >
                      {copiedError === error.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleError(error.id)}
                    >
                      {expandedErrors[error.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedErrors[error.id] && (
                <CardContent>
                  {error.stack && (
                    <div className="mt-2">
                      <h4 className="font-medium mb-2">Stack Trace</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded">
                    <h4 className="font-medium mb-2">Debugging Suggestions</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      {error.message.includes('undefined') && (
                        <li>Check for null/undefined values before accessing properties</li>
                      )}
                      {error.message.includes('dependency') && (
                        <li>Add missing dependencies to useEffect dependency array</li>
                      )}
                      {error.message.includes('Network') && (
                        <li>Verify API endpoints and network connectivity</li>
                      )}
                      <li>Review the component code around line {error.source.split(':')[1] || 'mentioned'}</li>
                      <li>Add error boundaries to gracefully handle component failures</li>
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
