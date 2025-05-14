
import { useToast as useHookToast, toast } from "@/hooks/use-toast";

// Re-export the toast function and hook with the same interface
export const useToast = useHookToast;
export { toast };
