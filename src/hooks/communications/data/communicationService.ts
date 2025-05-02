
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a new communication entry
 */
export async function createCommunicationEntry(params: {
  senderId: string;
  recipientId: string;
  message: string;
  type: string;
  adminId?: string | null;
}) {
  console.log("Creating communication entry with params:", params);
  
  const { data: communicationData, error: communicationError } = await supabase
    .from('employee_communications')
    .insert({
      sender_id: params.senderId,
      recipient_id: params.recipientId,
      message: params.message,
      type: params.type,
      status: 'pending',
      admin_cc: params.adminId || null
    })
    .select('*')
    .single();

  if (communicationError) {
    console.error("Error creating communication:", communicationError);
    throw communicationError;
  }
  
  console.log("Created communication:", communicationData);
  return communicationData;
}
