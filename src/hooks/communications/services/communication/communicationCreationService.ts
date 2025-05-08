
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

  // Validate admin ID if present
  if (params.adminId !== null && typeof params.adminId === 'string') {
    // Quick check for a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.adminId)) {
      console.error("Invalid admin ID format (not a UUID):", params.adminId);
      // Set to null instead of failing to maintain core functionality
      params.adminId = null;
    }
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
