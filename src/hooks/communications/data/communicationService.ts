
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
  
  try {
    // Validate required parameters
    if (!params.senderId) {
      throw new Error("Missing sender ID");
    }
    
    if (!params.recipientId) {
      throw new Error("Missing recipient ID");
    }
    
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
      throw new Error(`Database error: ${communicationError.message}`);
    }
    
    if (!communicationData) {
      console.error("No communication data returned after insert");
      throw new Error("Failed to create communication record: No data returned");
    }
    
    console.log("Created communication:", communicationData);
    return communicationData;
  } catch (error) {
    console.error("Failed in createCommunicationEntry:", error);
    throw error instanceof Error ? error : new Error("Unknown error in createCommunicationEntry");
  }
}
