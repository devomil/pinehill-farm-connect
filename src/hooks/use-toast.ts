
import { sonner } from "sonner";

// Extend the ExternalToast type to include our custom variant property
export interface ToastProps {
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      return sonner.toast(props.description, {
        duration: props.duration,
        className: props.variant ? `toast-${props.variant}` : '',
        action: props.action
      });
    }
  };
}

// Direct toast function for simpler usage
export const toast = (props: ToastProps) => {
  return sonner.toast(props.description, {
    duration: props.duration,
    className: props.variant ? `toast-${props.variant}` : '',
    action: props.action
  });
};

// For backward compatibility, maintain the old method structure with the new format
toast.success = (message: string, description?: string) => {
  return sonner.toast(description || message, {
    className: 'toast-success'
  });
};

toast.error = (message: string, description?: string) => {
  return sonner.toast(description || message, {
    className: 'toast-destructive'
  });
};

toast.warning = (message: string, description?: string) => {
  return sonner.toast(description || message, {
    className: 'toast-warning'
  });
};

toast.info = (message: string, description?: string) => {
  return sonner.toast(description || message, {
    className: 'toast-default'
  });
};
