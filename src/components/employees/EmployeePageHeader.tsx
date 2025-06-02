
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmployeeForm } from "./EmployeeForm";

interface EmployeePageHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  onAddEmployee: (newEmployee: any) => Promise<void>;
}

export function EmployeePageHeader({
  searchQuery,
  setSearchQuery,
  isFormOpen,
  setIsFormOpen,
  onAddEmployee
}: EmployeePageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Employee Directory</h1>
        <p className="text-muted-foreground">
          Manage and view all employees
        </p>
      </div>
      <div className="space-x-2 flex items-center">
        <Label htmlFor="search">Search:</Label>
        <Input
          id="search"
          type="search"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
              <DialogDescription>
                Create a new employee account.
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm onSubmit={onAddEmployee} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
