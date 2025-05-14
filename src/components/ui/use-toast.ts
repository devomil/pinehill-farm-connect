
import { useToast as useHookToast, toast } from "@/hooks/use-toast";

// Re-export the toast function while maintaining the same interface
export const useToast = useHookToast;
export { toast };
