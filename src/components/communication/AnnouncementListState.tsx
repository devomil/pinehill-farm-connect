
import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

export const AnnouncementLoading: React.FC = () => (
  <div className="text-center text-muted-foreground py-10">Loading...</div>
);

export const AnnouncementEmptyAll: React.FC = () => (
  <div className="text-center text-muted-foreground py-10">No announcements.</div>
);

export const AnnouncementEmptyUnread: React.FC = () => (
  <div className="text-center py-12">
    <CheckCircle className="mx-auto h-12 w-12 text-green-500 opacity-50" />
    <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      You have read all announcements.
    </p>
  </div>
);

export const AnnouncementEmptyUrgent: React.FC = () => (
  <div className="text-center py-12">
    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
    <h3 className="mt-4 text-lg font-medium">No urgent announcements</h3>
    <p className="mt-2 text-sm text-muted-foreground">
      There are currently no urgent announcements.
    </p>
  </div>
);

