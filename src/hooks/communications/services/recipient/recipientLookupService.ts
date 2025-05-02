
import { getRecipientData } from "../../data/messageDataService";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Service for finding and validating recipient profiles
 */
export async function findRecipientProfile(recipientId: string) {
  console.log("Looking up recipient profile for ID:", recipientId);
  
  if (!recipientId) {
    console.error("No recipient ID provided");
    throw new Error("No recipient ID provided");
  }

  try {
    // First attempt - try getting from the dataService for backward compatibility
    try {
      const recipient = await getRecipientData(recipientId);
      if (recipient) {
        console.log("Found recipient via data service:", recipient);
        return recipient;
      }
    } catch (error) {
      console.log("Recipient not found via data service, trying direct lookup");
    }
    
    // Second attempt - try direct profiles lookup
    const { data: directRecipient, error: directError } = await supabase
      .from('profiles')
      .select('id, name, email, updated_at')
      .eq('id', recipientId)
      .maybeSingle();
      
    if (directRecipient) {
      console.log("Found recipient via direct lookup:", directRecipient);
      return directRecipient;
    }
    
    if (directError) {
      console.error("Error in direct lookup:", directError);
    }
    
    // Third attempt - try fuzzy match if ID might be truncated or malformed
    if (recipientId && recipientId.length > 5) {
      const { data: fuzzyMatch } = await supabase
        .from('profiles')
        .select('id, name, email')
        .ilike('id', `%${recipientId.slice(-10)}%`)
        .limit(1);
        
      if (fuzzyMatch && fuzzyMatch.length > 0) {
        console.log("Found recipient with fuzzy match:", fuzzyMatch[0]);
        return fuzzyMatch[0];
      }
    }
    
    // Fourth attempt - lookup from cached employee directory (if available)
    try {
      const { data: cachedEmployees } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name', { ascending: true })
        .limit(50);
        
      if (cachedEmployees && cachedEmployees.length > 0) {
        console.log(`Found ${cachedEmployees.length} employees to check against`);
        // Log first few IDs for debugging
        cachedEmployees.slice(0, 5).forEach((emp, i) => {
          console.log(`Employee ${i}: ${emp.id} - ${emp.name}`);
        });
        
        const match = cachedEmployees.find(emp => emp.id === recipientId || emp.id?.includes(recipientId) || recipientId?.includes(emp.id));
        
        if (match) {
          console.log("Found recipient in employee directory:", match);
          return match;
        }
      }
    } catch (e) {
      console.error("Error checking employee directory:", e);
    }
    
    // If we get here, no recipient was found
    console.error(`Recipient not found in database with ID: ${recipientId}`);
    throw new Error("Recipient not found in database. Please refresh and try with another employee.");
  } catch (error: any) {
    console.error("Error in findRecipientProfile:", error);
    throw error;
  }
}

/**
 * Utility function to convert employee directory user to recipient format if needed
 */
export function normalizeRecipientData(employee: User) {
  return {
    id: employee.id,
    name: employee.name || "Unknown",
    email: employee.email || "",
  };
}

/**
 * Validate if an employee exists in the profiles table
 */
export async function validateEmployeeExists(employeeId: string): Promise<boolean> {
  if (!employeeId) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', employeeId)
      .maybeSingle();
      
    if (error) {
      console.error("Error validating employee:", error);
      return false;
    }
    
    return !!data;
  } catch (e) {
    console.error("Exception validating employee:", e);
    return false;
  }
}
