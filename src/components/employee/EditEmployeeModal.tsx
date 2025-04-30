
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { useEmployeeEdit } from "@/hooks/useEmployeeEdit";
import { Loader2 } from "lucide-react";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onEmployeeUpdate: () => void;
}

export function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdate,
}: EditEmployeeModalProps) {
  const { updateEmployeeDetails, isLoading, error } = useEmployeeEdit();
  
  const [employeeData, setEmployeeData] = React.useState<{
    name: string;
    department: string;
    position: string;
  }>({
    name: "",
    department: "",
    position: ""
  });

  React.useEffect(() => {
    if (employee) {
      setEmployeeData({
        name: employee.name || "",
        department: employee.department || "",
        position: employee.position || ""
      });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeData({
      ...employeeData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;
    
    const success = await updateEmployeeDetails(employee.id, employeeData);
    
    if (success) {
      onEmployeeUpdate();
      onClose();
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              name="name"
              value={employeeData.name} 
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input 
              id="department"
              name="department" 
              value={employeeData.department} 
              onChange={handleChange}
              placeholder="Department"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input 
              id="position"
              name="position" 
              value={employeeData.position} 
              onChange={handleChange}
              placeholder="Position"
            />
          </div>
          
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
