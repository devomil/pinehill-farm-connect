
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

    const subject = type === "report" 
      ? `New ${priority} Priority Report from ${employeeName}`
      : `New Time Off Request from ${employeeName}`;

    const content = type === "report"
      ? `${employeeName} has submitted a new ${priority} priority report that requires your attention.`
      : `${employeeName} has submitted a new time off request that requires your review.`;

    const emailResponse = await resend.emails.send({
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
    });

    console.log("Email sent successfully:", emailResponse);

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
