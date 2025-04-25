
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Using fetch directly since we don't have a specific Deno package
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

    const subject = type === "report" 
      ? `New ${priority} Priority Report from ${employeeName}`
      : `New Time Off Request from ${employeeName}`;

    const content = type === "report"
      ? `${employeeName} has submitted a new ${priority} priority report that requires your attention.`
      : `${employeeName} has submitted a new time off request that requires your review.`;

    // Using the Resend API directly with fetch as shown in the Node.js example
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "HR System <onboarding@resend.dev>",
        to: [adminEmail],
        subject: subject,
        html: `
          <h2>Hello ${adminName},</h2>
          <p>${content}</p>
          <p>Additional Details:</p>
          <pre>${JSON.stringify(details, null, 2)}</pre>
          <p>Please log in to the system to review the details.</p>
        `,
      }),
    });

    const responseData = await emailResponse.json();
    console.log("Email response:", responseData);

    return new Response(JSON.stringify(responseData), {
      status: emailResponse.status,
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
