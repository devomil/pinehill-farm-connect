
import { useState } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEmployeeEdit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEmployeeDetails = async (
    employeeId: string, 
    updates: { name?: string; department?: string; position?: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Updating employee details:", employeeId, updates);
      
      // Update the profile record with the new details
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          department: updates.department,
          position: updates.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);
      
      if (updateError) {
        console.error("Error updating employee:", updateError);
        setError(`Failed to update employee: ${updateError.message}`);
        toast.error(`Failed to update employee: ${updateError.message}`);
        return false;
      }
      
      toast.success("Employee details updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error in updateEmployeeDetails:", err);
      setError(err.message || "An unknown error occurred");
      toast.error(err.message || "Failed to update employee details");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateEmployeeDetails,
    isLoading,
    error
  };
}
