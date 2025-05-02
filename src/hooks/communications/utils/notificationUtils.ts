import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a notification using Supabase edge functions
 */
export async function sendMessageNotification(
  actionType: string,
  actor: User,
  assignedTo: { id: string; name: string; email: string },
  details: any
) {
  console.log(`Sending notification of type ${actionType} from ${actor.name} to ${assignedTo.name}`);
  
  const payload = {
    actionType,
    actor: {
      id: actor.id,
      name: actor.name,
      email: actor.email
    },
    assignedTo: {
      id: assignedTo.id,
      name: assignedTo.name,
      email: assignedTo.email
    },
    details
  };
  
  console.log("Sending notification payload:", JSON.stringify(payload, null, 2));

  const { data, error } = await supabase.functions.invoke('notify-manager', {
    body: payload
  });

  if (error) {
    console.error("Error sending notification:", error);
    throw error;
  }

  console.log("Notification sent successfully:", data);
  return data;
}

/**
 * Validates that the shift details contain all required fields
 */
export const validateShiftDetails = (shiftDetails: any): boolean => {
  if (!shiftDetails) return false;
  
  return !!(
    shiftDetails.shift_date && 
    shiftDetails.shift_start && 
    shiftDetails.shift_end && 
    // Make sure we have either explicit IDs or will use defaults
    (shiftDetails.original_employee_id || true) &&
    (shiftDetails.covering_employee_id || true)
  );
};
