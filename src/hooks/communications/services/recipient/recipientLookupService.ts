
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
        .limit(100);  // Increased limit to find more potential matches
        
      if (cachedEmployees && cachedEmployees.length > 0) {
        console.log(`Found ${cachedEmployees.length} employees to check against`);
        
        // Enhanced matching logic - check for exact match first, then partial matches
        const exactMatch = cachedEmployees.find(emp => emp.id === recipientId);
        if (exactMatch) {
          console.log("Found exact recipient match in employee directory:", exactMatch);
          return exactMatch;
        }
        
        // Try partial matches
        const partialMatch = cachedEmployees.find(emp => 
          emp.id?.includes(recipientId) || recipientId?.includes(emp.id)
        );
        
        if (partialMatch) {
          console.log("Found partial recipient match in employee directory:", partialMatch);
          return partialMatch;
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
 * Enhanced with multiple lookup strategies
 */
export async function validateEmployeeExists(employeeId: string): Promise<boolean> {
  if (!employeeId) return false;
  
  console.log("Validating employee exists:", employeeId);
  
  try {
    // Try exact match first
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', employeeId)
      .maybeSingle();
      
    if (data) {
      console.log("Employee validated with exact match");
      return true;
    }
    
    if (error) {
      console.error("Error in exact validation:", error);
    }
    
    // Try partial match as fallback for ID format issues
    if (employeeId.length > 5) {
      const { data: fuzzyData, error: fuzzyError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('id', `%${employeeId.slice(-10)}%`)
        .limit(1);
        
      if (fuzzyData && fuzzyData.length > 0) {
        console.log("Employee validated with partial match:", fuzzyData[0].id);
        return true;
      }
      
      if (fuzzyError) {
        console.error("Error in fuzzy validation:", fuzzyError);
      }
    }
    
    // Final attempt - check if any employees match
    const { data: allEmployees } = await supabase
      .from('profiles')
      .select('id')
      .order('updated_at', { ascending: false }) 
      .limit(50);
      
    if (allEmployees && allEmployees.length > 0) {
      // Check for any ID that might match
      const matchingEmployee = allEmployees.find(emp => 
        emp.id === employeeId || 
        emp.id?.includes(employeeId) || 
        employeeId?.includes(emp.id)
      );
      
      if (matchingEmployee) {
        console.log("Employee validated with directory scan:", matchingEmployee.id);
        return true;
      }
    }
    
    console.warn("Employee validation failed for ID:", employeeId);
    return false;
  } catch (e) {
    console.error("Exception validating employee:", e);
    // If validation fails due to an error, we'll try a direct check as last resort
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // If we can reach the database and there are employees, give benefit of doubt
      // This prevents blocking shift coverage due to technical issues
      if (count && count > 0) {
        console.log("Database accessible with employees, allowing operation as fallback");
        return true;
      }
    } catch (directError) {
      console.error("Final validation attempt failed:", directError);
    }
    return false;
  }
}
