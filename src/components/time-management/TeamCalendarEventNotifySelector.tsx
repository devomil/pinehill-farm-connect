
import React, { useEffect } from "react";
import { EmployeeSelector } from "@/components/communication/EmployeeSelector";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface Props {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  notifyAll: boolean;
  setNotifyAll: (v: boolean) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;
  allEmployees: User[];
}

export const TeamCalendarEventNotifySelector: React.FC<Props> = ({
  enabled,
  setEnabled,
  notifyAll,
  setNotifyAll,
  selectedUserIds,
  setSelectedUserIds,
  allEmployees
}) => {
  useEffect(() => {
    if (notifyAll) {
      setSelectedUserIds(allEmployees.map(e => e.id));
    }
    // eslint-disable-next-line
  }, [notifyAll, allEmployees]);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="send-notifications"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="send-notifications" className="flex items-center gap-1 font-medium">
          Send notifications to employees
        </label>
      </div>
      {enabled && (
        <div className="space-y-2 pl-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyAll}
              onChange={e => setNotifyAll(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Notify entire company</span>
          </label>
          {!notifyAll && (
            <div>
              <EmployeeSelector
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                allEmployees={allEmployees}
              />
              {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap mt-2 gap-1">
                  {selectedUserIds.map(id => {
                    const user = allEmployees.find(u => u.id === id);
                    return user ? <Badge key={id}>{user.name}</Badge> : null;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
