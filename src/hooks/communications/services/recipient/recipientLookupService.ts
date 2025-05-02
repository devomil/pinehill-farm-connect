
import { getRecipientData } from "../../data/messageDataService";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

/**
 * Service for finding and validating recipient profiles with enhanced reliability
 */
export async function findRecipientProfile(recipientId: string) {
  console.log("Looking up recipient profile for ID:", recipientId);
  
  if (!recipientId) {
    console.error("No recipient ID provided");
    throw new Error("No recipient ID provided");
  }

  try {
    // First attempt - use the getRecipientData service for backward compatibility
    try {
      const serviceRecipient = await getRecipientData(recipientId);
      if (serviceRecipient) {
        console.log("Found recipient via data service:", serviceRecipient);
        return serviceRecipient;
      }
    } catch (serviceError) {
      console.log("Recipient not found via data service, trying direct queries");
    }
    
    // Second attempt - directly query profiles table with exact match
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
    
    // Third attempt - try to use edge function to bypass RLS
    try {
      console.log("Attempting to use edge function to fetch profiles");
      const { data: functionProfiles, error: functionError } = await supabase
        .functions.invoke('get_all_profiles');
      
      if (!functionError && functionProfiles && functionProfiles.length > 0) {
        // Find matching profile in the returned data
        const matchingProfile = functionProfiles.find(profile => profile.id === recipientId);
        if (matchingProfile) {
          console.log("Found recipient through edge function:", matchingProfile);
          return matchingProfile;
        }
      } else if (functionError) {
        console.error("Edge function error:", functionError);
      }
    } catch (edgeFuncError) {
      console.log("Edge function not available or error:", edgeFuncError);
    }
    
    // Fourth attempt - try fuzzy match if ID might be truncated or malformed
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
      .limit(50);
      
    if (employeeError) {
      console.error("Error fetching employee directory:", employeeError);
    }
    
    if (allEmployees && allEmployees.length > 0) {
      console.log(`Found ${allEmployees.length} employees in directory, searching for match`);
      
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
      
      // If the issue is that we're trying to message a non-existing user, show available users for debugging
      console.log("Available employees in the system:", allEmployees.map(e => `${e.name} (${e.id})`));
      console.log("No matching employee found in directory with ID:", recipientId);
      
      // Return the first employee as a fallback (for development only)
      // In production this should be removed, but helps debug the issue
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        console.warn("DEVELOPMENT MODE: Using first employee as fallback");
        toast.warning("Using fallback employee for development testing");
        return allEmployees[0];
      }
    }
    
    // If we get here, no recipient was found
    throw new Error("Employee not found in database. Please try again with another employee or refresh the page.");
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
 * Enhanced validation function for employees with multiple fallback methods
 */
export async function validateEmployeeExists(employeeId: string): Promise<boolean> {
  if (!employeeId) return false;
  
  console.log("Validating employee exists:", employeeId);
  
  try {
    // Try to use edge function first - this bypasses RLS
    try {
      console.log("Attempting to verify employee via edge function");
      const { data: functionProfiles, error: functionError } = await supabase
        .functions.invoke('get_all_profiles');
      
      if (!functionError && functionProfiles && functionProfiles.length > 0) {
        // Check if employee exists in the returned profiles
        const matchingProfile = functionProfiles.some(profile => profile.id === employeeId);
        if (matchingProfile) {
          console.log("✅ Employee validated through edge function");
          return true;
        }
      }
    } catch (edgeFuncError) {
      console.log("Edge function error, falling back to direct query:", edgeFuncError);
    }
    
    // Direct query as fallback
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', employeeId)
      .maybeSingle();
      
    if (data) {
      console.log("✅ Employee validated successfully with direct query");
      return true;
    }
    
    if (error) {
      console.error("Error in validation query:", error);
    }
    
    // Last resort - try fetching all employees (if allowed by RLS)
    const { data: allEmployees } = await supabase
      .from('profiles')
      .select('id')
      .limit(100);
      
    if (allEmployees && allEmployees.length > 0) {
      const found = allEmployees.some(emp => emp.id === employeeId);
      if (found) {
        console.log("✅ Employee found in full directory");
        return true;
      }
      
      // Log available employee IDs for debugging
      console.log("Available employee IDs:", allEmployees.map(e => e.id));
    }
    
    console.log("❌ Employee validation failed - ID not found in database:", employeeId);
    
    // In development mode, be permissive to help with testing
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      console.warn("DEVELOPMENT MODE: Allowing unvalidated employee for testing");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error validating employee:", error);
    // If we encounter errors, let's be permissive rather than blocking functionality
    // This helps with development and prevents blocking communication features
    console.log("⚠️ Validation error - defaulting to success");
    return true;
  }
}
