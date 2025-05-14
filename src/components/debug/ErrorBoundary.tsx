
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { error as logError } from '@/utils/debugUtils';

interface ErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode | ((error: Error) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const prefix = this.props.componentName ? `[${this.props.componentName}] ` : '';
    
    // Log to our debug system
    const errorMessage = `${prefix}Error: ${error.message}`;
    logError('ErrorBoundary', errorMessage, { 
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Also log to console for immediate visibility during development
    console.error(errorMessage, {
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error as Error)
          : this.props.fallback;
      }
      
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Component Error</h3>
          <p className="text-sm text-red-700 mt-1">
            {this.props.componentName 
              ? `An error occurred in ${this.props.componentName}`
              : 'An error occurred in this component'
            }
          </p>
          <p className="text-xs text-red-600 mt-2">
            {this.state.error?.message || 'Unknown error'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
