
import { getRecipientData } from "../../data/messageDataService";

/**
 * Service for finding and validating recipient profiles
 */
export async function findRecipientProfile(recipientId: string) {
  console.log("Looking up recipient profile for ID:", recipientId);
  
  try {
    const recipient = await getRecipientData(recipientId);
    console.log("Found recipient:", recipient);
    return recipient;
  } catch (error: any) {
    console.error("Error finding recipient:", error.message);
    throw new Error(`Failed to find recipient: ${error.message}`);
  }
}
