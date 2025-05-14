
import { toast } from "@/hooks/use-toast";

type ToastType = "success" | "error" | "info" | "warning";

/**
 * A standardized helper function for displaying toast notifications
 * @param type The type of toast notification (success, error, info, warning)
 * @param message The message to display in the toast
 * @param titleOverride Optional custom title that overrides the default
 */
export function showToast(type: ToastType, message: string, titleOverride?: string) {
  const titles: Record<ToastType, string> = {
    success: "Success",
    error: "Error",
    info: "Notice",
    warning: "Warning",
  };

  const variants: Record<ToastType, "default" | "destructive" | "success" | "warning"> = {
    success: "success",
    error: "destructive",
    info: "default",
    warning: "warning",
  };

  toast({
    title: titleOverride || titles[type],
    description: message,
    variant: variants[type],
  });
}
