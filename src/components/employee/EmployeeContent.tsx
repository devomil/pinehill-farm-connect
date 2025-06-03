
import React from "react";
import { EmployeeSearchBar } from "./EmployeeSearchBar";
import { EmployeeTable } from "./EmployeeTable";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="w-full max-w-none">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Employee Directory</CardTitle>
          <p className="text-gray-600 text-sm">Manage and view all employees</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-6">
            <div className="px-6">
              <EmployeeSearchBar 
                query={searchQuery} 
                onQueryChange={setSearchQuery} 
              />
            </div>
            
            {error && (
              <div className="px-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            
            <div className="overflow-hidden">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
