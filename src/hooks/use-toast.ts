
import { toast as sonnerToast, type ExternalToast } from "sonner";

// Extend the ExternalToast type to include our custom variant property
export interface ToastProps extends ExternalToast {
  variant?: "default" | "destructive" | "success" | "warning";
}

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      return sonnerToast(props);
    }
  };
}

// Direct toast function for simpler usage
export const toast = (props: ToastProps) => {
  return sonnerToast(props);
};

// For backward compatibility, maintain the old method structure
// but have them use the new object format internally
const successToast = (title: string, description?: string) => {
  return sonnerToast({
    description: description || title,
    variant: "success"
  });
};

const errorToast = (title: string, description?: string) => {
  return sonnerToast({
    description: description || title,
    variant: "destructive"
  });
};

const warningToast = (title: string, description?: string) => {
  return sonnerToast({
    description: description || title,
    variant: "warning"
  });
};

const infoToast = (title: string, description?: string) => {
  return sonnerToast({
    description: description || title,
    variant: "default"
  });
};

// Add these methods to toast for backward compatibility
toast.success = successToast;
toast.error = errorToast;
toast.warning = warningToast;
toast.info = infoToast;
