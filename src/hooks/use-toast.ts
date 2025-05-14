
import { toast as sonnerToast, Toast as SonnerToast, ExternalToast } from "sonner";

export type ToastProps = ExternalToast;

export function useToast() {
  return {
    toast: {
      success: (title: string, description?: string) => {
        return sonnerToast({
          title,
          description,
          variant: "success"
        });
      },
      error: (title: string, description?: string) => {
        return sonnerToast({
          title,
          description,
          variant: "destructive"
        });
      },
      warning: (title: string, description?: string) => {
        return sonnerToast({
          title,
          description,
          variant: "warning"
        });
      },
      info: (title: string, description?: string) => {
        return sonnerToast({
          title,
          description,
          variant: "default"
        });
      },
    }
  };
}

// Direct toast function for simpler usage
export const toast = {
  success: (title: string, description?: string) => {
    return sonnerToast({
      title,
      description,
      variant: "success"
    });
  },
  error: (title: string, description?: string) => {
    return sonnerToast({
      title,
      description,
      variant: "destructive"
    });
  },
  warning: (title: string, description?: string) => {
    return sonnerToast({
      title,
      description,
      variant: "warning"
    });
  },
  info: (title: string, description?: string) => {
    return sonnerToast({
      title,
      description,
      variant: "default"
    });
  },
  // Expose the raw toast function for direct object usage
  ...sonnerToast
};
