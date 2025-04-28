
export interface NotificationRequest {
  actionType: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  details: any;
}

export interface ManagerProfile {
  id: string;
  email: string;
  name: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
