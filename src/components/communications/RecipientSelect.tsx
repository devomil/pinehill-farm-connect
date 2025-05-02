
import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { NewMessageFormData } from "@/types/communications";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Combined props interface to support both direct usage and form usage
interface RecipientSelectProps {
  employees: User[];
  value?: string;
  onChange?: (value: string) => void;
  form?: UseFormReturn<NewMessageFormData>;
  onRefresh?: () => void;
}

export function RecipientSelect({ employees, value, onChange, form, onRefresh }: RecipientSelectProps) {
  const [localEmployees, setLocalEmployees] = useState<User[]>(employees || []);
  
  // Check if we have any valid recipients
  const hasRecipients = localEmployees.length > 0;
  
  // Update local employees when prop changes
  useEffect(() => {
    if (employees && employees.length > 0) {
      setLocalEmployees(employees);
    }
  }, [employees]);

  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefresh) {
      toast.info("Refreshing employee list...");
      onRefresh();
    }
  };

  // If using form integration
  if (form) {
    return (
      <FormField
        control={form.control}
        name="recipientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between">
              <span>Select Employee</span>
              {onRefresh && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2"
                  onClick={handleRefresh}
                  type="button"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Refresh</span>
                </Button>
              )}
            </FormLabel>
            <FormControl>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!hasRecipients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={hasRecipients ? "Select recipient" : "No recipients available"} />
                </SelectTrigger>
                <SelectContent>
                  {hasRecipients ? (
                    localEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name || employee.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-recipient" disabled>
                      No recipients available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            {!hasRecipients && onRefresh && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  type="button"
                  className="w-full"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span>Refresh Employee List</span>
                </Button>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Direct props usage
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="recipient">Select Employee</Label>
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Refresh</span>
          </Button>
        )}
      </div>
      <Select 
        onValueChange={onChange} 
        value={value}
        disabled={!hasRecipients}
      >
        <SelectTrigger>
          <SelectValue placeholder={hasRecipients ? "Select recipient" : "No recipients available"} />
        </SelectTrigger>
        <SelectContent>
          {hasRecipients ? (
            localEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name || employee.email}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-recipient" disabled>
              No recipients available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {!hasRecipients && onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="w-full mt-2"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          <span>Refresh Employee List</span>
        </Button>
      )}
    </div>
  );
}
