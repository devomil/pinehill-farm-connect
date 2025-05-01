
import React from "react";
import { Card } from "@/components/ui/card";
import { EmployeeList } from "./EmployeeList";
import { User } from "@/types";
import { Communication } from "@/types/communications/communicationTypes";

interface EmployeeListViewProps {
  employees: User[];
  isLoading: boolean;
  onSelectEmployee: (employee: User) => void;
  selectedEmployee: User | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadMessages: Communication[];
  onRefresh: () => void;
}

export function EmployeeListView({
  employees,
  isLoading,
  onSelectEmployee,
  selectedEmployee,
  searchQuery,
  setSearchQuery,
  unreadMessages,
  onRefresh
}: EmployeeListViewProps) {
  return (
    <Card className="md:col-span-1 p-4">
      <EmployeeList
        employees={employees}
        isLoading={isLoading}
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
