
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
    return sonnerToast.success(props.title, {
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
    return sonnerToast.info(props.title, {
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
    return sonnerToast.warning(props.title, {
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
    return sonnerToast.error(props.title, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Map to correct Sonner toast property names
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };

  // Create a toast object that provides access to all variants
  const toastObject = {
    success,
    info,
    warning,
    error: destructive,
  };

  // Return toast object
  return toastObject;
};

// Export the toast object for direct usage
export const toast = {
  success: (title: string, description?: string) => sonnerToast.success(title, { description }),
  error: (title: string, description?: string) => sonnerToast.error(title, { description }),
  info: (message: ReactNode, data?: ExternalToast) => sonnerToast(message, data),
  warning: (message: ReactNode, data?: ExternalToast) => sonnerToast.warning(message, data),
  loading: (message: ReactNode, data?: ExternalToast) => sonnerToast.loading(message, data),
  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  message: sonnerToast,
};

// Re-export the hook
export default useToast;
