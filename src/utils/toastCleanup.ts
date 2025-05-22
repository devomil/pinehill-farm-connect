
import { toast } from "sonner";

/**
 * Helper function to clean up any active toasts
 * This can be called when navigating between pages or components to ensure
 * we don't have lingering toast notifications
 */
export function cleanupActiveToasts(toastIds: (string | null)[]) {
  toastIds.forEach(id => {
    if (id) {
      try {
        toast.dismiss(id);
      } catch (error) {
        console.error("Error cleaning up toast:", error);
      }
    }
  });
}

/**
 * Dismisses all visible toasts
 * Can be used in emergency situations to clear the UI
 */
export function dismissAllToasts() {
  try {
    toast.dismiss();
  } catch (error) {
    console.error("Error dismissing all toasts:", error);
  }
}
