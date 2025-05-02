import { toast } from 'sonner';

/**
 * Creates a throttled toast function to prevent showing too many toasts
 */
export const createThrottledToast = (lastToastTimeRef: React.MutableRefObject<number>) => {
  return (message: string, type: 'success' | 'error' = 'success') => {
    const now = Date.now();
    // Only show a toast if it's been at least 5 seconds since the last one
    if (now - lastToastTimeRef.current > 5000) {
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
      lastToastTimeRef.current = now;
    }
  };
};

/**
 * Process time off requests to ensure proper format and add computed fields
 */
export const processTimeOffRequests = (data: any[], userProfiles: Record<string, any> = {}) => {
  return data.map((r: any) => ({
    ...r,
    // Keep the original snake_case properties
    // Add camelCase aliases for compatibility
    startDate: new Date(r.start_date),
    endDate: new Date(r.end_date),
    userId: r.user_id,
    // Ensure reason is never undefined
    reason: r.reason || '',
    // Add profile data if available (for admin view)
    profiles: userProfiles[r.user_id] || null
  }));
};
