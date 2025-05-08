
import { createCommunicationEntry } from "../../data/messageDataService";

/**
 * Service for creating communication records
 */
export async function createCommunicationRecord(params: {
  senderId: string;
  recipientId: string;
  message: string;
  type: string;
  adminId: string | null;
}) {
  console.log("Creating communication entry with params:", JSON.stringify(params, null, 2));
  
  // Validate required fields
  if (!params.senderId) {
    console.error("Missing sender ID in createCommunicationRecord");
    throw new Error("Missing sender ID");
  }
  
  if (!params.recipientId) {
    console.error("Missing recipient ID in createCommunicationRecord");
    throw new Error("Missing recipient ID");
  }
  
  try {
    const communicationData = await createCommunicationEntry(params);
    
    if (!communicationData || !communicationData.id) {
      throw new Error("No data returned from createCommunicationEntry");
    }
    
    console.log("Communication created successfully:", communicationData.id);
    return communicationData;
  } catch (error) {
    console.error("Failed to create communication entry:", error);
    throw error instanceof Error ? error : new Error("Failed to create communication record");
  }
}
