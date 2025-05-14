
import { toast as sonnerToast } from 'sonner';
import { info, error } from '@/utils/debugUtils';

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
      onCancel: props.onCancel,
      onAction: props.onAction,
    });
  };

  const success = (props: ToastProps) => {
    info(COMPONENT, `Success toast: ${props.title || 'Untitled'}`);
    return sonnerToast.success(props.title, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      onCancel: props.onCancel,
      onAction: props.onAction,
    });
  };

  const warning = (props: ToastProps) => {
    info(COMPONENT, `Warning toast: ${props.title || 'Untitled'}`);
    return sonnerToast.warning(props.title, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      onCancel: props.onCancel,
      onAction: props.onAction,
    });
  };

  const destructive = (props: ToastProps) => {
    error(COMPONENT, `Error toast: ${props.title || 'Untitled'}`);
    return sonnerToast.error(props.title, {
      description: props.description,
      action: props.action,
      cancel: props.cancel,
      onCancel: props.onCancel,
      onAction: props.onAction,
    });
  };

  return {
    toast,
    success,
    warning,
    error: destructive,
    // For backward compatibility
    toast: {
      ...sonnerToast,
      // Add logger to standard toast methods
      error: (title: string, description?: string) => {
        error(COMPONENT, `Error toast: ${title}`);
        return sonnerToast.error(title, { description });
      },
      success: (title: string, description?: string) => {
        info(COMPONENT, `Success toast: ${title}`);
        return sonnerToast.success(title, { description });
      }
    }
  };
};

export { useToast };
export const toast = sonnerToast;
