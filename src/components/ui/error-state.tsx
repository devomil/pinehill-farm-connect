
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorStateProps {
  title?: string;
  message?: string;
  variant?: "card" | "alert" | "inline";
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error while loading this content.",
  variant = "card",
  onRetry,
  retryLabel = "Try again",
  showIcon = true,
  className = ""
}) => {
  const content = (
    <div className="text-center space-y-3">
      {showIcon && (
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
      )}
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="mt-3"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  );

  if (variant === "alert") {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          {onRetry && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRetry}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center space-x-2 text-sm text-destructive ${className}`}>
        {showIcon && <AlertTriangle className="h-4 w-4" />}
        <span>{message}</span>
        {onRetry && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetry}
            className="h-auto p-0 text-destructive hover:text-destructive/80"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="py-8">
        {content}
      </CardContent>
    </Card>
  );
};
