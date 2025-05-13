
import { useToast as useHookToast } from "@/hooks/use-toast";

// Re-export the toast function while maintaining the same interface
export const useToast = useHookToast;
export const toast = useHookToast().toast;
