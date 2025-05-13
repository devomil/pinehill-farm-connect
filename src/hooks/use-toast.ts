
// This is a wrapper around a toast library
import { toast as sonnerToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  id?: string;
  action?: React.ReactNode;
}

export function toast(props: ToastProps) {
  const { title, description, variant, duration } = props;

  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      duration,
    });
  }

  return sonnerToast(title, {
    description,
    duration,
  });
}

export type ToastActionElement = React.ReactElement<HTMLAnchorElement | HTMLButtonElement>;

export function useToast() {
  // Create a mock toasts array to satisfy the component expecting it
  const toasts: any[] = [];
  
  return {
    toast,
    toasts
  };
}
