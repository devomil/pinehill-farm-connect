
import React from "react";
import { Card } from "@/components/ui/card";
import { EmployeeList } from "./EmployeeList";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

interface EmployeeListViewProps {
  employees: User[];
  loading: boolean;
  onSelectEmployee: (employee: User) => void;
  selectedEmployee?: User | null;
  onRefresh: () => void;
  messages?: Communication[];
  unreadMessages?: Communication[];
}

export function EmployeeListView({
  employees,
  loading,
  onSelectEmployee,
  selectedEmployee = null,
  onRefresh,
  messages = [],
  unreadMessages = []
}: EmployeeListViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <Card className="md:col-span-1 p-4">
      <EmployeeList
        employees={employees}
        isLoading={loading}
        onSelectEmployee={onSelectEmployee}
        selectedEmployee={selectedEmployee}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadMessages={unreadMessages}
        onRefresh={onRefresh}
      />
    </Card>
  );
}
