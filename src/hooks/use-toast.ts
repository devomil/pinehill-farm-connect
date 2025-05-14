
import { toast as sonnerToast } from 'sonner';
import { info, error } from '@/utils/debugUtils';
import { ReactNode } from 'react';
import { ExternalToast } from 'sonner';

const COMPONENT = 'toast';

// Define our toast props with proper types
export interface ToastProps {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  cancel?: ReactNode;
  onCancel?: () => void;
  onAction?: () => void;
  variant?: "default" | "destructive" | "success";
}

export const useToast = () => {
  // Basic toast function
  const success = (props: ToastProps) => {
    info(COMPONENT, `Success toast: ${props.title}`);
    return sonnerToast.success(props.title || '', {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Map to correct Sonner toast property names
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };

  const info = (props: ToastProps) => {
    info(COMPONENT, `Info toast: ${props.title}`);
    return sonnerToast.info(props.title || '', {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Map to correct Sonner toast property names
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };
  
  const warning = (props: ToastProps) => {
    info(COMPONENT, `Warning toast: ${props.title}`);
    return sonnerToast.warning(props.title || '', {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Map to correct Sonner toast property names
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };

  const destructive = (props: ToastProps) => {
    error(COMPONENT, `Destructive toast: ${props.title}`);
    return sonnerToast.error(props.title || '', {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Map to correct Sonner toast property names
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };

  // Return an object with toast method directly on it
  return {
    success,
    info,
    warning,
    error: destructive,
    toast: {
      success,
      info,
      warning,
      error: destructive
    }
  };
};

// Export the standalone toast object for direct usage
export const toast = {
  success: (title: string, description?: string) => sonnerToast.success(title, { description }),
  error: (title: string, description?: string) => sonnerToast.error(title, { description }),
  info: (title: string, description?: string) => sonnerToast(title, { description }),
  warning: (title: string, description?: string) => sonnerToast.warning(title, { description }),
  loading: (message: string, data?: ExternalToast) => sonnerToast.loading(message, data),
  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  message: sonnerToast,
};

// Re-export the hook
export default useToast;
