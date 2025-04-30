
import React from "react";
import { EmployeeHR } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormValues } from "./schemas/employeeFormSchema";
import { DateFields } from "./hr-fields/DateFields";
import { EmploymentFields } from "./hr-fields/EmploymentFields";
import { ContactFields } from "./hr-fields/ContactFields";
import { AdditionalFields } from "./hr-fields/AdditionalFields";

interface EmployeeHRDataProps {
  employeeHR: EmployeeHR | null;
  handleHRDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setEmployeeHR: React.Dispatch<React.SetStateAction<EmployeeHR | null>>;
  form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeHRData({ employeeHR, handleHRDataChange, setEmployeeHR, form }: EmployeeHRDataProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <DateFields 
          form={form} 
          handleHRDataChange={handleHRDataChange} 
        />
        
        <EmploymentFields 
          form={form} 
          handleHRDataChange={handleHRDataChange}
          setEmployeeHR={setEmployeeHR} 
        />
        
        <ContactFields 
          form={form} 
          handleHRDataChange={handleHRDataChange} 
        />
        
        <AdditionalFields 
          form={form} 
          handleHRDataChange={handleHRDataChange} 
        />
      </div>
    </div>
  );
}
