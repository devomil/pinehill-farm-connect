
import { Resend } from "npm:resend@2.0.0";
import { NotificationRequest, corsHeaders } from "./types.ts";
import { 
  generateEmailSubject,
  generateEmailContent,
  formatDetailsAsHtml,
  formatDetailsAsPlainText,
  generateHtmlEmail,
  generatePlainTextEmail
} from "./emailTemplates.ts";

// Initialize Resend client
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return !!email && email.includes('@');
}

/**
 * Validate that the notification isn't being sent to the sender
 */
export function validateNotSendingToSelf(
  adminEmail: string, 
  senderEmail?: string
): boolean {
  return !senderEmail || adminEmail !== senderEmail;
}

/**
 * Send notification email using Resend
 */
export async function sendAdminNotification(
  request: NotificationRequest
): Promise<Response> {
  const { 
    adminEmail, 
    adminName,
    adminId,
    type, 
    priority, 
    employeeName, 
    details 
  } = request;
  
  // Validate email address
  if (!validateEmail(adminEmail)) {
    console.error(`Invalid email address provided: "${adminEmail}"`);
    return new Response(
      JSON.stringify({ error: "Invalid email address format", providedEmail: adminEmail }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Check we're not sending to the same person who created the notification
  if (!validateNotSendingToSelf(adminEmail, details?.senderEmail)) {
    console.warn(`Warning: Notification would be sent to the same person who created it (${adminEmail}). Aborting.`);
    return new Response(
      JSON.stringify({ error: "Cannot send notification to the notification creator" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Generate email content
    const subject = generateEmailSubject(type, priority, employeeName, details);
    const content = generateEmailContent(type, priority, employeeName, details);
    
    // Format details for both HTML and plaintext
    const detailsHtml = formatDetailsAsHtml(details);
    const detailsText = formatDetailsAsPlainText(details);
    
    // Generate full email templates
    const htmlContent = generateHtmlEmail(subject, adminName, content, detailsHtml);
    const plainTextContent = generatePlainTextEmail(adminName, content, detailsText);
    
    // Record the sending time for troubleshooting
    const sendingTime = new Date().toISOString();
    console.log(`[${sendingTime}] Attempting to send email notification to: ${adminEmail}`);
    
    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: `HR System <hr@notifications.pinehillfarm.co>`,
      to: [adminEmail],
      subject: subject,
      html: htmlContent,
      text: plainTextContent,
      reply_to: "notifications@pinehillfarm.co",
    });

    console.log(`[${sendingTime}] Email API response:`, JSON.stringify(emailResponse, null, 2));

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}
