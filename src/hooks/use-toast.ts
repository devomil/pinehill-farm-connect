
import { toast as sonnerToast, Toast as SonnerToast, ExternalToast } from "sonner";

export type ToastProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  [key: string]: any;
};

export function useToast() {
  return {
    toast: {
      success: (title: string, description?: string) => {
        return sonnerToast.success(title, {
          description,
        });
      },
      error: (title: string, description?: string) => {
        return sonnerToast.error(title, {
          description,
        });
      },
      warning: (title: string, description?: string) => {
        return sonnerToast.warning(title, {
          description,
        });
      },
      info: (title: string, description?: string) => {
        return sonnerToast.info(title, {
          description,
        });
      },
    }
  };
}

// Direct toast function for simpler usage
export const toast = {
  success: (title: string, description?: string) => {
    return sonnerToast.success(title, {
      description,
    });
  },
  error: (title: string, description?: string) => {
    return sonnerToast.error(title, {
      description,
    });
  },
  warning: (title: string, description?: string) => {
    return sonnerToast.warning(title, {
      description,
    });
  },
  info: (title: string, description?: string) => {
    return sonnerToast.info(title, {
      description,
    });
  },
  // Add the raw sonner toast to support other use cases
  ...sonnerToast
};
