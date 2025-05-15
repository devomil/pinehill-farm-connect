
import React from "react";
import { WorkScheduleEditorProps } from "@/types/workSchedule";
import { format } from "date-fns";
import { CardDescription } from "@/components/ui/card";
import { useScheduleEditor } from "./hooks/useScheduleEditor";
import { AdminSchedulingTools } from "./AdminSchedulingTools";
import { ScheduleEditorContent } from "./ScheduleEditorContent";
import { NoEmployeeSelected } from "./NoEmployeeSelected";

export const AdminWorkScheduleEditor: React.FC<WorkScheduleEditorProps> = ({
  selectedEmployee,
  scheduleData,
  onSave,
  onReset,
  loading
}) => {
  // Use the schedule editor hook
  const editorState = useScheduleEditor({ 
    selectedEmployee, 
    scheduleData, 
    onSave 
  });

  if (!selectedEmployee) {
    return <NoEmployeeSelected />;
  }
  
  return (
    <div className="space-y-4">
      <CardDescription>
        Schedule for {format(editorState.currentMonth, 'MMMM yyyy')}
      </CardDescription>
      
      <ScheduleEditorContent 
        editorState={editorState}
        loading={loading}
        onReset={onReset}
      />
    </div>
  );
};
