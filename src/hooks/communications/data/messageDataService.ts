
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { SendMessageParams } from "@/types/communications/communicationTypes";

/**
 * Finds recipient data by ID
 */
export async function getRecipientData(recipientId: string) {
  console.log("Fetching recipient data for ID:", recipientId);
  
  if (!recipientId) {
    console.error("No recipient ID provided");
    throw new Error("No recipient ID provided");
  }

  const { data: recipientData, error: recipientError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', recipientId)
    .maybeSingle(); // Use maybeSingle instead of expecting an array

  if (recipientError) {
    console.error("Error fetching recipient data:", recipientError);
    throw new Error(`Database error when finding recipient: ${recipientError.message}`);
  }

  if (!recipientData) {
    console.error(`No recipient found with ID: ${recipientId}`);
    
    // Double-check if recipient exists with a more basic query
    const { data: checkData } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recipientId)
      .maybeSingle();
      
    if (!checkData) {
      throw new Error(`Recipient not found. Please refresh and try again.`);
    } else {
      // Recipient exists but data wasn't retrieved correctly
      throw new Error(`Error retrieving recipient details. Please try again.`);
    }
  }
  
  console.log("Found recipient:", recipientData);
  return recipientData;
}

/**
 * Finds admin data for a message (either specified admin or employee's assigned admin)
 */
export async function findAdminForMessage(currentUser: User, adminCc?: string) {
  let adminData = null;
  
  // If adminCc is manually set, use that ID
  if (adminCc) {
    const { data: manualAdmin, error: manualAdminError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', adminCc)
      .maybeSingle();
      
    if (!manualAdminError && manualAdmin) {
      adminData = manualAdmin;
      console.log("Using specified admin CC:", adminData);
      return adminData;
    } else {
      console.warn("Specified admin CC not found:", adminCc, manualAdminError);
    }
  }
  
  // If no admin found yet, fall back to the employee's assigned admin
  if (!adminData && currentUser?.id) {
    // Find the admin assigned to the current user (requester)
    const { data: adminAssignment, error: adminError } = await supabase
      .from('employee_assignments')
      .select('admin_id, admin:profiles!employee_assignments_admin_id_fkey(id, name, email)')
      .eq('employee_id', currentUser.id)
      .maybeSingle();

    if (!adminError && adminAssignment?.admin) {
      adminData = adminAssignment.admin;
      console.log("Found requester's admin:", adminData);
      return adminData;
    } else {
      console.warn("No admin found for requester:", currentUser.id, adminError);
    }
  }
  
  return null;
}

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
    throw communicationError;
  }
  
  console.log("Created communication:", communicationData);
  return communicationData;
}

/**
 * Creates a shift coverage request - CRITICAL FIX: Completely rewritten with direct approach
 */
export async function createShiftCoverageRequest(
  communicationId: string, 
  shiftDetails: {
    original_employee_id: string;
    covering_employee_id: string;
    shift_date: string;
    shift_start: string;
    shift_end: string;
    communication_id?: string;
  }
) {
  // CRITICAL FIX: Add additional logging before insert
  console.log("===== CREATING SHIFT COVERAGE REQUEST =====");
  console.log("Communication ID:", communicationId);
  console.log("Original employee:", shiftDetails.original_employee_id);
  console.log("Covering employee:", shiftDetails.covering_employee_id);
  console.log("Shift date:", shiftDetails.shift_date);
  console.log("Shift time:", `${shiftDetails.shift_start} - ${shiftDetails.shift_end}`);
  
  // Prepare shift coverage request payload
  const shiftPayload = {
    communication_id: communicationId,
    original_employee_id: shiftDetails.original_employee_id,
    covering_employee_id: shiftDetails.covering_employee_id,
    shift_date: shiftDetails.shift_date,
    shift_start: shiftDetails.shift_start,
    shift_end: shiftDetails.shift_end,
    status: 'pending'
  };
  
  console.log("Sending shift coverage request payload:", JSON.stringify(shiftPayload, null, 2));
  
  // CRITICAL FIX: Use direct, simplified query to minimize points of failure
  try {
    const { data, error } = await supabase
      .from('shift_coverage_requests')
      .insert(shiftPayload)
      .select();
    
    if (error) {
      console.error("Supabase Error creating shift coverage request:", error);
      console.error("Error details:", error.details, error.hint, error.message);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("No data returned after insert");
      throw new Error("No data returned after insert");
    }
    
    console.log("Successfully created shift coverage request:", data);
    return data;
  } catch (e: any) {
    console.error("Exception creating shift coverage request:", e);
    // Let's try a direct API call as a fallback
    try {
      console.log("Attempting direct API call to create shift coverage request");
      
      // Get the dynamic Supabase URL from the client
      const supabaseUrl = supabase.supabaseUrl;
      const supabaseKey = supabase.supabaseKey;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/shift_coverage_requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Prefer": "return=representation"
          },
          body: JSON.stringify(shiftPayload)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Direct API call failed with status: ${response.status}`);
      }
      
      const directData = await response.json();
      console.log("Direct API call successful:", directData);
      return directData;
    } catch (directError: any) {
      console.error("Direct API call failed:", directError);
      throw new Error(`Failed to create shift coverage request: ${directError.message}`);
    }
  }
}

/**
 * Verifies a shift coverage request was created
 */
export async function verifyShiftCoverageRequest(communicationId: string, shiftDate: string, originalEmployeeId: string) {
  // First check by communication ID
  const { data: checkData, error: checkError } = await supabase
    .from('shift_coverage_requests')
    .select('*')
    .eq('communication_id', communicationId);

  if (checkError) {
    console.error("Error verifying shift coverage request:", checkError);
    return { verified: false, error: checkError };
  }
  
  if (checkData && checkData.length > 0) {
    console.log("✅ Verification successful - shift coverage request exists:", checkData);
    return { verified: true, data: checkData };
  }
  
  // If not found by communication ID, try by date and employee
  const { data: allRecent, error: allRecentError } = await supabase
    .from('shift_coverage_requests')
    .select('*')
    .eq('original_employee_id', originalEmployeeId)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (allRecentError) {
    console.error("Error checking recent shift requests:", allRecentError);
    return { verified: false, error: allRecentError };
  }
  
  // Find requests that match our date
  const matchingRequests = allRecent?.filter(req => 
    req.shift_date === shiftDate
  );
  
  if (matchingRequests && matchingRequests.length > 0) {
    console.log("✅ Found matching shift request by date:", matchingRequests[0]);
    return { verified: true, data: matchingRequests };
  }
  
  console.warn("⚠️ Could not verify shift request was saved - no matching requests found");
  
  // Remove the direct rpc call that was causing the TypeScript error
  // Instead, do a more detailed raw query using supabase's query builder
  try {
    console.log("Attempting additional detailed query to find the shift request");
    const { data: detailedCheck, error: detailedError } = await supabase
      .from('shift_coverage_requests')
      .select('*')
      .or(`communication_id.eq.${communicationId},original_employee_id.eq.${originalEmployeeId}`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (detailedError) {
      console.error("Detailed query check failed:", detailedError);
    } else {
      console.log("Detailed query results:", detailedCheck);
      if (detailedCheck && detailedCheck.length > 0) {
        return { verified: true, data: detailedCheck };
      }
    }
  } catch (e) {
    console.log("Detailed check error:", e);
  }
  
  console.log("Recent shift requests:", allRecent);
  return { verified: false, data: allRecent };
}
