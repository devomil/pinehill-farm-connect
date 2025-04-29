
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
  type: "report" | "timeoff";
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
      type, 
      priority, 
      employeeName, 
      details 
    }: NotificationRequest = await req.json();

    console.log(`Processing notification to ${adminName} (${adminEmail}) from ${employeeName}`);

    // Verify that adminEmail is actually an email address
    if (!adminEmail || !adminEmail.includes('@')) {
      console.error(`Invalid email address provided: "${adminEmail}"`);
      return new Response(
        JSON.stringify({ error: "Invalid email address format", providedEmail: adminEmail }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify we're not accidentally sending to the same person who created the report
    if (adminEmail === details?.senderEmail) {
      console.warn(`Warning: Notification would be sent to the same person who created it (${adminEmail}). Aborting.`);
      return new Response(
        JSON.stringify({ error: "Cannot send notification to the report creator" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subject = type === "report" 
      ? `New ${priority} Priority Report from ${employeeName}`
      : `New Time Off Request from ${employeeName}`;

    const content = type === "report"
      ? `${employeeName} has submitted a new ${priority} priority report that requires your attention.`
      : `${employeeName} has submitted a new time off request that requires your review.`;

    // Format details as a readable HTML table if they exist
    let detailsHtml = '';
    if (details) {
      detailsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; border: 1px solid #eee;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
      `;
      
      for (const [key, value] of Object.entries(details)) {
        // Skip the senderEmail field as it's just for validation
        if (key === 'senderEmail') continue;
        
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

    console.log(`Sending email notification to: ${adminEmail}`);

    // Using the Resend API with proper templating and your verified domain
    const emailResponse = await resend.emails.send({
      from: `HR System <notifications@notifications.pinehillfarm.co>`,
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
              
              <a href="https://pinehillfarm-connect.lovable.dev" class="button">Log in to review</a>
              
              <p>Thank you,<br>Pine Hill Farm HR System</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the Pine Hill Farm HR System.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email response:", emailResponse);

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
