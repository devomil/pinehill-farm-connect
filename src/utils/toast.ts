import { toast } from "@/hooks/use-toast";

type ToastType = "success" | "error" | "info" | "warning";
type ToastVariant = "default" | "destructive" | "success" | "warning";

interface ToastOptions {
  description: string;
  variant: ToastVariant;
  duration?: number;
}

/**
 * A standardized helper function for displaying toast notifications
 * Can be called with either:
 * - (type, message) format: showToast("success", "Operation completed")
 * - (options) format: showToast({ description: "Operation completed", variant: "success" })
 */
export function showToast(typeOrOptions: ToastType | ToastOptions, message?: string) {
  // If first argument is an object, use the new format
  if (typeof typeOrOptions === 'object') {
    toast({
      description: typeOrOptions.description,
      variant: typeOrOptions.variant,
      duration: typeOrOptions.duration,
    });
    return;
  }
  
  // Otherwise use the old format (type, message)
  const type = typeOrOptions as ToastType;
  const variants: Record<ToastType, ToastVariant> = {
    success: "success",
    error: "destructive",
    info: "default",
    warning: "warning",
  };

  toast({
    description: message || "",
    variant: variants[type],
  });
}
