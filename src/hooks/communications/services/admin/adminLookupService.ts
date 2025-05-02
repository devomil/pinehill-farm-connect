
import { User } from "@/types";
import { findAdminForMessage } from "../../data/messageDataService";

/**
 * Service for finding admin data for communications
 */
export async function findAdminForCommunication(
  currentUser: User,
  messageType: string,
  adminCc?: string
) {
  // Only look for an admin if this is a shift coverage request
  if (messageType === 'shift_coverage') {
    console.log("Looking for admin to CC for shift coverage request");
    try {
      const adminData = await findAdminForMessage(currentUser, adminCc);
      console.log("Admin data for CC:", adminData);
      return adminData;
    } catch (error) {
      console.error("Failed to find admin for message:", error);
      // Don't throw here - a missing admin is not a critical error
      return null;
    }
  }
  return null;
}
