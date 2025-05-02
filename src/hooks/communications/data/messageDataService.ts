
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { SendMessageParams } from "@/types/communications/communicationTypes";

/**
 * Finds recipient data by ID
 */
export async function getRecipientData(recipientId: string) {
  const { data: recipientData, error: recipientError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', recipientId);

  if (recipientError) {
    console.error("Error fetching recipient data:", recipientError);
    throw new Error(`Database error when finding recipient: ${recipientError.message}`);
  }

  if (!recipientData || recipientData.length === 0) {
    console.error(`No recipient found with ID: ${recipientId}`);
    throw new Error(`Recipient not found. Please refresh and try again.`);
  }
  
  // Use first matching recipient
  const recipient = recipientData[0];
  console.log("Found recipient:", recipient);
  return recipient;
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
 * Creates a shift coverage request
 */
export async function createShiftCoverageRequest(
  communicationId: string, 
  shiftDetails: {
    original_employee_id: string;
    covering_employee_id: string;
    shift_date: string;
    shift_start: string;
    shift_end: string;
  }
) {
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
  
  const { data: shiftData, error: shiftError } = await supabase
    .from('shift_coverage_requests')
    .insert(shiftPayload)
    .select('*');

  if (shiftError) {
    console.error("Error creating shift coverage request:", shiftError);
    throw shiftError;
  }
  
  console.log("Created shift coverage request:", shiftData);
  return shiftData;
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
  console.log("Recent shift requests:", allRecent);
  return { verified: false, data: allRecent };
}
