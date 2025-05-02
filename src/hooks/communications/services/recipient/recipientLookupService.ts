
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
    // First attempt - directly query profiles table with exact match
    const { data: recipient, error } = await supabase
      .from('profiles')
      .select('id, name, email, updated_at')
      .eq('id', recipientId)
      .maybeSingle();
      
    if (recipient) {
      console.log("Found recipient with direct lookup:", recipient);
      return recipient;
    }
    
    if (error) {
      console.error("Error in direct lookup:", error);
      // Continue to try other methods
    }
    
    // Second attempt - try using data service for backward compatibility
    try {
      const serviceRecipient = await getRecipientData(recipientId);
      if (serviceRecipient) {
        console.log("Found recipient via data service:", serviceRecipient);
        return serviceRecipient;
      }
    } catch (serviceError) {
      console.log("Recipient not found via data service, continuing with other methods");
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
    
    // Last attempt - check entire employee directory as a fallback
    const { data: allEmployees, error: employeeError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('updated_at', { ascending: false })
      .limit(20);
      
    if (employeeError) {
      console.error("Error fetching employee directory:", employeeError);
    }
    
    if (allEmployees && allEmployees.length > 0) {
      // First try for exact match
      const exactMatch = allEmployees.find(emp => emp.id === recipientId);
      if (exactMatch) {
        console.log("Found exact match in employee directory:", exactMatch);
        return exactMatch;
      }
      
      // Then try for partial match
      const partialMatch = allEmployees.find(emp => 
        emp.id.includes(recipientId) || recipientId.includes(emp.id)
      );
      
      if (partialMatch) {
        console.log("Found partial match in employee directory:", partialMatch);
        return partialMatch;
      }
      
      console.log("No matching employee found in directory with ID:", recipientId);
    }
    
    // If we get here, no recipient was found
    throw new Error("Employee not found in database. Please try again with another employee.");
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
 * Completely rewritten for more robust validation
 */
export async function validateEmployeeExists(employeeId: string): Promise<boolean> {
  if (!employeeId) return false;
  
  console.log("Validating employee exists:", employeeId);
  
  try {
    // Direct query with exact match - most reliable
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', employeeId)
      .limit(1);
      
    if (data && data.length > 0) {
      console.log("✅ Employee validated successfully with exact match");
      return true;
    }
    
    // If exact match fails, try fetching all profiles and check manually
    // This is a fallback in case of database connection issues
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(50);
    
    if (allProfiles && allProfiles.length > 0) {
      // Check if any profile matches the employee ID
      const matchingProfile = allProfiles.some(profile => profile.id === employeeId);
      
      if (matchingProfile) {
        console.log("✅ Employee validated with fallback method");
        return true;
      }
    }
    
    console.warn("❌ Employee validation failed for ID:", employeeId);
    return false;
  } catch (error) {
    console.error("Error validating employee:", error);
    return false;
  }
}
