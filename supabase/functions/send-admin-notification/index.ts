
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  adminEmail: string;
  adminName: string;
  adminId?: string;
  type: "report" | "timeoff" | "message";
  priority?: string;
  employeeName: string;
  details?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      adminEmail, 
      adminName,
      adminId,
      type, 
      priority, 
      employeeName, 
      details 
    }: NotificationRequest = await req.json();

    console.log(`Processing notification to ${adminName} (${adminEmail}) ID: ${adminId || 'unknown'} from ${employeeName}`);
    console.log(`Full notification details:`, JSON.stringify({ 
      adminEmail, 
      adminName,
      adminId,
      type, 
      priority, 
      employeeName, 
      details 
    }, null, 2));

    // Verify that adminEmail is actually an email address
    if (!adminEmail || !adminEmail.includes('@')) {
      console.error(`Invalid email address provided: "${adminEmail}"`);
      return new Response(
        JSON.stringify({ error: "Invalid email address format", providedEmail: adminEmail }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify we're not accidentally sending to the same person who created the notification
    if (adminEmail === details?.senderEmail) {
      console.warn(`Warning: Notification would be sent to the same person who created it (${adminEmail}). Aborting.`);
      return new Response(
        JSON.stringify({ error: "Cannot send notification to the notification creator" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Set subject and content based on notification type
    let subject, content;
    
    if (type === "report") {
      subject = `New ${priority} Priority Report from ${employeeName}`;
      content = `${employeeName} has submitted a new ${priority} priority report that requires your attention.`;
    } else if (type === "timeoff") {
      subject = `New Time Off Request from ${employeeName}`;
      content = `${employeeName} has submitted a new time off request that requires your review.`;
    } else if (type === "message") {
      const messageType = details?.messageType || "new_message";
      
      if (messageType === "shift_coverage_request") {
        subject = `Shift Coverage Request from ${employeeName}`;
        content = `${employeeName} has requested coverage for a shift and needs your response.`;
      } else if (messageType === "shift_coverage_response") {
        const response = details?.response === "accepted" ? "accepted" : "declined";
        subject = `Shift Coverage ${response === "accepted" ? "Accepted" : "Declined"} by ${employeeName}`;
        content = `${employeeName} has ${response} your request for shift coverage.`;
      } else {
        subject = `New Message from ${employeeName}`;
        content = `${employeeName} has sent you a new message.`;
      }
    } else {
      subject = `New Notification from ${employeeName}`;
      content = `${employeeName} has sent you a notification that requires your attention.`;
    }

    // Format details as a readable HTML table if they exist
    let detailsHtml = '';
    if (details) {
      detailsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; border: 1px solid #eee;">
          <h3 style="margin-top: 0;">Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
      `;
      
      for (const [key, value] of Object.entries(details)) {
        // Skip internal fields
        if (key === 'senderEmail' || key === 'messageType') continue;
        
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        detailsHtml += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${formattedKey}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td>
          </tr>
        `;
      }
      
      detailsHtml += `
          </table>
        </div>
      `;
    }

    // Generate plain text version of the email
    const plainTextContent = `
Hello ${adminName},

${content}

Details:
${details ? Object.entries(details)
  .filter(([key]) => key !== 'senderEmail' && key !== 'messageType')
  .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
  .join('\n') : ''}

Log in to review: https://pinehillfarm.co/hr

Thank you,
Pine Hill Farm HR System

This is an automated message from the Pine Hill Farm HR System.
    `;

    // Record the sending time for troubleshooting
    const sendingTime = new Date().toISOString();
    console.log(`[${sendingTime}] Attempting to send email notification to: ${adminEmail}`);
    
    // Use the verified domain for sending emails
    const emailResponse = await resend.emails.send({
      from: `HR System <hr@notifications.pinehillfarm.co>`,
      to: [adminEmail],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${subject}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header { 
                background-color: #3b82f6;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                padding: 20px;
                background-color: #fff;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 5px 5px;
              }
              .button {
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 10px 20px;
                margin: 20px 0;
                text-decoration: none;
                border-radius: 5px;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${subject}</h2>
            </div>
            <div class="content">
              <p>Hello ${adminName},</p>
              <p>${content}</p>
              
              ${detailsHtml}
              
              <a href="https://pinehillfarm.co/hr" class="button">Log in to review</a>
              
              <p>Thank you,<br>Pine Hill Farm HR System</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the Pine Hill Farm HR System.</p>
            </div>
          </body>
        </html>
      `,
      text: plainTextContent,
      reply_to: "notifications@pinehillfarm.co",
    });

    console.log(`[${sendingTime}] Email API response:`, JSON.stringify(emailResponse, null, 2));

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
