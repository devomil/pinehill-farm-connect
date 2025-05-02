

// Type definitions for the notification service

export interface NotificationRequest {
  adminEmail: string;
  adminName: string;
  adminId?: string;
  type: "report" | "timeoff" | "message" | "shift_coverage";
  priority?: string;
  employeeName: string;
  details?: any;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

