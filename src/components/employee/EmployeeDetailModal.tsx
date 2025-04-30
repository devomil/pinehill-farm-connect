
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import { EmployeeBasicInfo } from "./EmployeeBasicInfo";
import { EmployeeHRData } from "./EmployeeHRData";
import { EmployeeRoles } from "./EmployeeRoles";
import { useEmployeeDetail } from "./hooks/useEmployeeDetail";

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onEmployeeUpdate: () => void;
}

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdate,
}: EmployeeDetailModalProps) {
  const {
    employeeData,
    employeeHR,
    isLoading,
    selectedRoles,
    handleBasicInfoChange,
    handleHRDataChange,
    handleRoleChange,
    saveEmployeeData,
    setEmployeeHR
  } = useEmployeeDetail(employee, onEmployeeUpdate, onClose);

  if (!employeeData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details: {employeeData.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="hr">HR Data</TabsTrigger>
            <TabsTrigger value="roles">Roles & Access</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <EmployeeBasicInfo 
              employeeData={employeeData}
              handleBasicInfoChange={handleBasicInfoChange}
            />
          </TabsContent>
          <TabsContent value="hr">
            <EmployeeHRData 
              employeeHR={employeeHR}
              handleHRDataChange={handleHRDataChange}
              setEmployeeHR={setEmployeeHR}
            />
          </TabsContent>
          <TabsContent value="roles">
            <EmployeeRoles 
              selectedRoles={selectedRoles}
              handleRoleChange={handleRoleChange}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={saveEmployeeData} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
