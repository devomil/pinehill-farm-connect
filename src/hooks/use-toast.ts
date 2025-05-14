
import { toast as sonnerToast, Toast as SonnerToast, ExternalToast } from "sonner";

export type ToastProps = ExternalToast;

export function useToast() {
  return {
    toast: (props: ExternalToast) => {
      return sonnerToast(props);
    }
  };
}

// Direct toast function for simpler usage
export const toast = (props: ExternalToast) => {
  return sonnerToast(props);
};

// For backward compatibility, maintain the old method structure
// but have them use the new object format internally
const successToast = (title: string, description?: string) => {
  return sonnerToast({
    title,
    description,
    variant: "success"
  });
};

const errorToast = (title: string, description?: string) => {
  return sonnerToast({
    title,
    description,
    variant: "destructive"
  });
};

const warningToast = (title: string, description?: string) => {
  return sonnerToast({
    title,
    description,
    variant: "warning"
  });
};

const infoToast = (title: string, description?: string) => {
  return sonnerToast({
    title,
    description,
    variant: "default"
  });
};

// Add these methods to toast for backward compatibility
toast.success = successToast;
toast.error = errorToast;
toast.warning = warningToast;
toast.info = infoToast;
