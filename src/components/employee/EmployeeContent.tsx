
import React from "react";
import { EmployeeSearchBar } from "./EmployeeSearchBar";
import { EmployeeTable } from "./EmployeeTable";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EmployeeContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  employees: User[];
  loading: boolean;
  onEdit: (employee: User) => void;
  onDelete: (id: string) => void;
  onResetPassword: (employee: User) => void;
  onView?: (employee: User) => void;
  isAdmin: boolean;
  error: string | null;
}

export function EmployeeContent({ 
  searchQuery, 
  setSearchQuery, 
  employees, 
  loading, 
  onEdit, 
  onDelete, 
  onResetPassword, 
  onView,
  isAdmin,
  error 
}: EmployeeContentProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <EmployeeSearchBar 
            query={searchQuery} 
            onQueryChange={setSearchQuery} 
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <EmployeeTable 
            employees={employees} 
            loading={loading} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onResetPassword={onResetPassword}
            onView={onView}
            isAdmin={isAdmin}
          />
        </div>
      </CardContent>
    </Card>
  );
}
