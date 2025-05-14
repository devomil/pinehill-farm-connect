
import { useToast as useHookToast, toast, type ToastProps } from "@/hooks/use-toast";

// Re-export the toast function and hook with the same interface
export const useToast = useHookToast;
export { toast, type ToastProps };
