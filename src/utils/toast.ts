
import { toast } from "@/hooks/use-toast";

type ToastType = "success" | "error" | "info" | "warning";

/**
 * A standardized helper function for displaying toast notifications
 * @param type The type of toast notification (success, error, info, warning)
 * @param message The message to display in the toast
 * @param titleOverride Optional custom title that overrides the default (ignored in current implementation)
 */
export function showToast(type: ToastType, message: string, titleOverride?: string) {
  const variants: Record<ToastType, "default" | "destructive" | "success" | "warning"> = {
    success: "success",
    error: "destructive",
    info: "default",
    warning: "warning",
  };

  toast({
    description: message,
    variant: variants[type],
  });
}
