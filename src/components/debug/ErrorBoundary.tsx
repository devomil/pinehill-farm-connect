
import React, { Component, ErrorInfo, ReactNode } from "react";
import { error } from "@/utils/debugUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, Bug, ChevronDown, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName: string;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log the error using our debugging utility
    const { componentName, onError } = this.props;
    error(componentName, "Component error caught:", {
      error,
      componentStack: errorInfo.componentStack,
    });

    // Call optional error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  public render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      return (
        <Card className="border-destructive/50 shadow-sm">
          <CardHeader>
            <AlertTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Error in {componentName}
            </AlertTitle>
            <AlertDescription>
              {error?.message || "An unexpected error occurred"}
            </AlertDescription>
          </CardHeader>
          <CardContent>
            <Collapsible open={showDetails} onOpenChange={this.toggleDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center mb-2">
                  <Bug className="h-3 w-3 mr-1" />
                  {showDetails ? "Hide" : "Show"} Technical Details
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showDetails ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-2 bg-muted/50 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-[200px]">
                  <div className="font-bold mb-1">Error:</div>
                  {error?.toString()}
                  
                  {error?.stack && (
                    <>
                      <div className="font-bold mt-2 mb-1">Stack:</div>
                      {error.stack}
                    </>
                  )}
                  
                  {errorInfo?.componentStack && (
                    <>
                      <div className="font-bold mt-2 mb-1">Component Stack:</div>
                      {errorInfo.componentStack}
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {fallback || (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription>
                  This component encountered an error. Try refreshing the page or contact support if the issue persists.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={this.handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
