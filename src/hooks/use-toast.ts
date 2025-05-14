
import { toast as sonnerToast } from 'sonner';
import { info, error } from '@/utils/debugUtils';
import { ReactNode } from 'react';
import { ExternalToast } from 'sonner';

const COMPONENT = 'toast';

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  cancel?: React.ReactNode;
  onCancel?: () => void;
  onAction?: () => void;
  variant?: "default" | "destructive";
};

const useToast = () => {
  const toast = (props: ToastProps) => {
    info(COMPONENT, `Toast shown: ${props.title || 'Untitled'}`);
    return sonnerToast(props.title, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Fix: use cancel instead of onCancel to match ExternalToast type
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };

  const success = (props: ToastProps) => {
    info(COMPONENT, `Success toast: ${props.title || 'Untitled'}`);
    return sonnerToast.success(props.title, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Fix: use cancel instead of onCancel to match ExternalToast type
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };

  const warning = (props: ToastProps) => {
    info(COMPONENT, `Warning toast: ${props.title || 'Untitled'}`);
    return sonnerToast.warning(props.title, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Fix: use cancel instead of onCancel to match ExternalToast type
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };

  const destructive = (props: ToastProps) => {
    error(COMPONENT, `Error toast: ${props.title || 'Untitled'}`);
    return sonnerToast.error(props.title, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      // Fix: use cancel instead of onCancel to match ExternalToast type
      onDismiss: props.onCancel,
      onAutoClose: props.onAction,
    });
  };

  // Create proper toast object with methods
  const toastObject = {
    toast,
    success,
    warning,
    error: destructive,
  };

  // Return toast object without toasts property
  return toastObject;
};

// Export the hook
export { useToast };

// Create and export a singleton instance for direct imports
export const toast = {
  ...sonnerToast,
  // Override standard methods with logging
  error: (title: string, description?: string) => {
    error(COMPONENT, `Error toast: ${title}`);
    return sonnerToast.error(title, { description });
  },
  success: (title: string, description?: string) => {
    info(COMPONENT, `Success toast: ${title}`);
    return sonnerToast.success(title, { description });
  },
  warning: (title: string, description?: string) => {
    info(COMPONENT, `Warning toast: ${title}`);
    return sonnerToast.warning(title, { description });
  },
  info: (title: string, description?: string) => {
    info(COMPONENT, `Info toast: ${title}`);
    return sonnerToast.info(title, { description });
  }
};
