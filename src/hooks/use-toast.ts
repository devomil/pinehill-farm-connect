
import { toast as sonnerToast } from "sonner";

// Extend the ToastProps interface with our custom properties
export interface ToastProps {
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  id?: string;
  onDismiss?: () => void;
}

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      return sonnerToast(props.description, {
        duration: props.duration,
        className: props.variant ? `toast-${props.variant}` : '',
        action: props.action,
        id: props.id,
        onDismiss: props.onDismiss
      });
    }
  };
}

// Direct toast function for simpler usage
export const toast = (props: ToastProps) => {
  return sonnerToast(props.description, {
    duration: props.duration,
    className: props.variant ? `toast-${props.variant}` : '',
    action: props.action,
    id: props.id,
    onDismiss: props.onDismiss
  });
};

// For backward compatibility, maintain the old method structure with the new format
toast.success = (message: string, description?: string) => {
  return sonnerToast(description || message, {
    className: 'toast-success'
  });
};

toast.error = (message: string, description?: string) => {
  return sonnerToast(description || message, {
    className: 'toast-destructive'
  });
};

toast.warning = (message: string, description?: string) => {
  return sonnerToast(description || message, {
    className: 'toast-warning'
  });
};

toast.info = (message: string, description?: string) => {
  return sonnerToast(description || message, {
    className: 'toast-default'
  });
};
