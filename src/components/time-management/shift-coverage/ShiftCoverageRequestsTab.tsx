
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShiftCoverageDialog } from "./ShiftCoverageDialog";
import { useShiftCoverage } from "./useShiftCoverage";
import { useTimeManagement } from "@/contexts/timeManagement";

export const ShiftCoverageRequestsTab: React.FC = () => {
  const { allEmployees } = useTimeManagement();
  const {
    isDialogOpen,
    selectedEmployee,
    openDialog,
    closeDialog,
    handleConfirmShifts
  } = useShiftCoverage();

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Employee Shift Coverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allEmployees?.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.department || "No department"}
                    </p>
                  </div>
                  <Button onClick={() => openDialog({ id: employee.id, name: employee.name })}>
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isDialogOpen && selectedEmployee && (
          <ShiftCoverageDialog
            isOpen={isDialogOpen}
            onClose={closeDialog}
            employeeId={selectedEmployee.id}
            employeeName={selectedEmployee.name}
            onConfirm={handleConfirmShifts}
          />
        )}
      </CardContent>
    </Card>
  );
};
