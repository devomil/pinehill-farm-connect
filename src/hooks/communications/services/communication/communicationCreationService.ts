
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
  console.log("Creating communication entry");
  
  try {
    const communicationData = await createCommunicationEntry(params);
    console.log("Communication created successfully:", communicationData.id);
    return communicationData;
  } catch (error) {
    console.error("Failed to create communication entry:", error);
    throw new Error("Failed to create communication record");
  }
}
