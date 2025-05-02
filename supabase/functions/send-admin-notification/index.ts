
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { NotificationRequest, corsHeaders } from "./types.ts";
import { sendAdminNotification } from "./emailService.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: NotificationRequest = await req.json();

    console.log(`Processing notification to ${request.adminName} (${request.adminEmail}) ID: ${request.adminId || 'unknown'} from ${request.employeeName}`);
    console.log(`Full notification details:`, JSON.stringify(request, null, 2));

    // Forward the request to the email service
    return await sendAdminNotification(request);
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
